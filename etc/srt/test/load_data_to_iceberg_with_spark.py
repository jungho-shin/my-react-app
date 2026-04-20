from pyspark.sql import SparkSession
from pyspark.sql.types import StructType
import pandas as pd


# ── 1. SparkSession (S3A + MinIO 설정) ──────────────────────────────────────
def create_spark_session() -> SparkSession:
    return (
        SparkSession.builder
        .appName("minio-writer")
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

        # ❌ 누락됨 — 이것들이 없으면 Iceberg S3 클라이언트가 여전히 minio:9000 사용
        .config("spark.sql.catalog.iceberg_catalog.s3.endpoint", "http://localhost:9000")
        .config("spark.sql.catalog.iceberg_catalog.s3.path-style-access", "true")
        .config("spark.sql.catalog.iceberg_catalog.s3.access-key-id", "minioadmin")
        .config("spark.sql.catalog.iceberg_catalog.s3.secret-access-key", "minioadmin")

        # S3A → MinIO
        .config("spark.hadoop.fs.s3a.endpoint", "http://localhost:9000")
        .config("spark.hadoop.fs.s3a.access.key", "minioadmin")
        .config("spark.hadoop.fs.s3a.secret.key", "minioadmin")
        .config("spark.hadoop.fs.s3a.path.style.access", "true")
        .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem")

        # ── ✅ AWS SDK가 자격증명을 찾을 수 있도록 JVM 시스템 프로퍼티로 전달
        .config("spark.driver.extraJavaOptions",
                "-Daws.accessKeyId=minioadmin "
                "-Daws.secretAccessKey=minioadmin "
                "-Daws.region=us-east-1")
        .config("spark.executor.extraJavaOptions",
                "-Daws.accessKeyId=minioadmin "
                "-Daws.secretAccessKey=minioadmin "
                "-Daws.region=us-east-1")

        # ✅ 2. 파티션 수 조절 (write 병렬화)
        .config("spark.sql.shuffle.partitions", "8")  # 기본값 200 → 데이터 크기에 맞게 축소
        # ✅ 3. 드라이버 메모리 증설 (50만 건 직렬화 부담 완화)
        .config("spark.driver.memory", "4g")
        # ✅ 4. Arrow 배치 크기 조절 (createDataFrame 분할 처리)
        .config("spark.sql.execution.arrow.maxRecordsPerBatch", "50000")  # 기본 10000
        .getOrCreate()
    )


# ── 2. CSV → Spark DataFrame 로드 ───────────────────────────────────────────
def read_csv_as_spark_df(spark: SparkSession, csv_path: str):
    df = (
        spark.read
        .option("header", "true")
        .option("inferSchema", "true")
        .csv(csv_path)
    )
    print(f"DataFrame 로드 완료: {df.count():,}행 x {len(df.columns)}열")
    df.printSchema()
    return df


# ── 3. Spark DataFrame → MinIO 적재 ─────────────────────────────────────────
def write_to_minio(df, bucket: str, path: str, fmt: str = "parquet"):
    """
    fmt: "parquet" | "csv" | "json" | "delta"
    """
    s3_path = f"s3a://{bucket}/{path}"

    writer = df.write.mode("overwrite")

    if fmt == "parquet":
        writer.parquet(s3_path)

    elif fmt == "csv":
        writer.option("header", "true").csv(s3_path)

    elif fmt == "json":
        writer.json(s3_path)

    elif fmt == "orc":
        writer.orc(s3_path)

    elif fmt == "avro":
        writer.format("avro").save(s3_path)

    elif fmt == "delta":
        writer.format("delta").save(s3_path)

    elif fmt == "iceberg":
        CATALOG = "iceberg_catalog"
        DATABASE = "test_db"
        TABLE = "detection_logs"

        iceberg_table = f"{CATALOG}.{DATABASE}.{TABLE}"

        df.writeTo(iceberg_table) \
            .tableProperty("write.format.default", "parquet") \
            .append()

    elif fmt == "hudi":
        writer.format("hudi") \
              .option("hoodie.table.name", path.replace("/", "_")) \
              .option("hoodie.datasource.write.operation", "upsert") \
              .save(s3_path)

    else:
        raise ValueError(f"지원하지 않는 포맷: {fmt}")

    print(f"✅ 적재 완료: {s3_path} (format={fmt})")


# ── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import time
    from pathlib import Path

    CSV_PATH   = str(Path(__file__).resolve().parent.parent / "herb24_100k_data.csv")
    BUCKET     = "warehouse"
    OBJECT_PATH = "herb07/herb07_100k_data"   # 디렉터리 형태로 저장됨

    spark = create_spark_session()

    try:
        # ✅ 카탈로그 등록 검증
        print("=== 등록된 카탈로그 ===")
        spark.sql("SHOW CATALOGS").show()

        df = read_csv_as_spark_df(spark, CSV_PATH)

        t = time.time()
        write_to_minio(df, BUCKET, OBJECT_PATH, fmt="iceberg")
        print(f"소요 시간: {time.time() - t:.2f}s")

    finally:
        spark.stop()