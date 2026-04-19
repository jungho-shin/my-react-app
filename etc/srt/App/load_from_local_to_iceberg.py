import os
import time

import pandas as pd
from pathlib import Path
from pyspark.sql import SparkSession


def load_data_via_connect(csv_path):
    # [Point] 클라이언트는 복잡한 설정 없이 서버 주소만 필요합니다.
    # 모든 Iceberg/Nessie 설정은 이미 Docker의 spark-connect 서버가 들고 있습니다.
    n_start_time = time.time()
    spark = (
        SparkSession.builder
        .appName("CsvToIceberg")

        # ✅ Iceberg JAR 자동 다운로드 (최초 1회, ~/.ivy2 에 캐싱됨)
        .config(
            "spark.jars.packages",
            "org.apache.iceberg:iceberg-spark-runtime-3.5_2.12:1.5.0,"
            "org.apache.iceberg:iceberg-aws-bundle:1.5.0"
        )

        # Iceberg 확장
        .config(
            "spark.sql.extensions",
            "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions",
        )

        # 카탈로그: iceberg_catalog (테이블 생성 시 사용한 이름과 일치)
        .config("spark.sql.catalog.iceberg_catalog", "org.apache.iceberg.spark.SparkCatalog")
        .config("spark.sql.catalog.iceberg_catalog.type", "rest")
        .config("spark.sql.catalog.iceberg_catalog.uri", "http://localhost:19120/iceberg/")
        .config("spark.sql.catalog.iceberg_catalog.warehouse", "warehouse")
        .config("spark.sql.catalog.iceberg_catalog.s3.remote-signing-enabled", "false")

        # S3A → MinIO
        .config("spark.hadoop.fs.s3a.endpoint", "http://localhost:9000")
        .config("spark.hadoop.fs.s3a.access.key", "minioadmin")
        .config("spark.hadoop.fs.s3a.secret.key", "minioadmin")
        .config("spark.hadoop.fs.s3a.path.style.access", "true")
        .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem")

        # ✅ 2. 파티션 수 조절 (write 병렬화)
        .config("spark.sql.shuffle.partitions", "8")  # 기본값 200 → 데이터 크기에 맞게 축소
        # ✅ 3. 드라이버 메모리 증설 (50만 건 직렬화 부담 완화)
        .config("spark.driver.memory", "4g")
        # ✅ 4. Arrow 배치 크기 조절 (createDataFrame 분할 처리)
        .config("spark.sql.execution.arrow.maxRecordsPerBatch", "50000")  # 기본 10000

        .getOrCreate()
    )
    n_end_time = time.time()
    print(f" create spark : {n_end_time - n_start_time} ")

    print(f"🐼 2. Pandas로 데이터 읽기: {csv_path.name}")
    # Spark Connect에서 로컬 파일을 직접 spark.read.csv로 읽으려면 서버에 파일이 있어야 하므로,
    # 클라이언트의 파일을 Pandas로 먼저 읽는 것이 가장 확실한 방법입니다.
    pdf = pd.read_csv(csv_path)

    # 시간 데이터 포맷팅 (Pandas object -> datetime64)
    pdf['detect_time'] = pd.to_datetime(pdf['detect_time'])

    print(f"🚀 3. Pandas DF -> Spark DF 변환 및 전송 (건수: {len(pdf)})")
    # Arrow를 통해 Spark 서버로 데이터가 전송됩니다.
    n_start_time = time.time()
    sdf = spark.createDataFrame(pdf)
    n_end_time = time.time()
    print(f" createDataFrame : {n_end_time - n_start_time} ")

    n_start_time = time.time()
    count = sdf.count()
    n_end_time = time.time()
    print(f" count : {n_end_time - n_start_time}, {count} ")

    print("⚡ 4. Iceberg 테이블 적재 시작 (iceberg_catalog.test_db.detection_logs)...")
    # 스키마가 없다면 생성, 있다면 덮어쓰기/추가
    # 처음 생성 시에는 append()
    n_start_time = time.time()
    sdf.writeTo("iceberg_catalog.test_db.detection_logs") \
        .tableProperty("write.format.default", "parquet") \
        .append()
    n_end_time = time.time()
    print(f" write : {n_end_time - n_start_time} ")

    print("✅ 5. 적재 데이터 검증 (Spark SQL)")
    # SQL 쿼리도 Connect 서버에서 실행되어 결과만 리턴받습니다.
    count_df = spark.sql("SELECT count(*) as total FROM iceberg_catalog.test_db.detection_logs")
    count_df.show()

    spark.sql("SELECT * FROM iceberg_catalog.test_db.detection_logs LIMIT 5").show(truncate=False)

    print("🎉 Iceberg 적재 완료!")
    print("StarRocks 조회 확인:")
    print("  SELECT * FROM iceberg_catalog.test_db.detection_logs LIMIT 10;")

    # 연결 종료
    spark.stop()


if __name__ == "__main__":
    # 데이터 경로 설정 (부모 디렉토리의 CSV 파일)
    script_dir = Path(__file__).resolve().parent.parent
    csv_filename = script_dir / "herb24_100k_data.csv"

    if csv_filename.exists():
        load_data_via_connect(csv_filename)
    else:
        print(f"❌ 에러: CSV 파일을 찾을 수 없습니다. 경로: {csv_filename}")