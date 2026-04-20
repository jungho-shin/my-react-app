from pyspark.sql import SparkSession
from pyspark.sql import DataFrame
from pyspark.sql.types import StructType
import pandas as pd


# ── 1. SparkSession (S3A + MinIO 설정) ──────────────────────────────────────
def create_spark_session() -> SparkSession:
    return (
        SparkSession.builder
        .appName("minio-writer")
        .config("spark.jars.packages",
                "org.apache.hadoop:hadoop-aws:3.3.4,"
                "com.amazonaws:aws-java-sdk-bundle:1.12.367")

        # S3A → MinIO 엔드포인트
        .config("spark.hadoop.fs.s3a.endpoint",          "http://localhost:9000")
        .config("spark.hadoop.fs.s3a.access.key",        "minioadmin")
        .config("spark.hadoop.fs.s3a.secret.key",        "minioadmin")
        .config("spark.hadoop.fs.s3a.path.style.access", "true")   # path-style 필수
        .config("spark.hadoop.fs.s3a.impl",
                "org.apache.hadoop.fs.s3a.S3AFileSystem")
        .config("spark.hadoop.fs.s3a.connection.ssl.enabled", "false")  # HTTP

        # 멀티파트 업로드 설정 (대용량 안정성)
        .config("spark.hadoop.fs.s3a.multipart.size",           "104857600")  # 100MB
        .config("spark.hadoop.fs.s3a.fast.upload",              "true")
        .config("spark.hadoop.fs.s3a.fast.upload.buffer",       "bytebuffer")
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
        # Iceberg는 경로 방식이 아닌 카탈로그 테이블명으로 저장
        # df.writeTo(f"iceberg_catalog.{bucket}.{path}") \
        #   .using("iceberg") \
        #   .createOrReplace()
        CATALOG = "iceberg_catalog"
        DATABASE = "herb24"
        TABLE = "detection_logs"

        iceberg_table = f"{CATALOG}.{DATABASE}.{TABLE}"

        df.writeTo(iceberg_table) \
            .using("iceberg") \
            .createOrReplace()

    elif fmt == "hudi":
        writer.format("hudi") \
              .option("hoodie.table.name", path.replace("/", "_")) \
              .option("hoodie.datasource.write.operation", "upsert") \
              .save(s3_path)

    else:
        raise ValueError(f"지원하지 않는 포맷: {fmt}")

    print(f"✅ 적재 완료: {s3_path} (format={fmt})")


# ── 4. MinIO → Spark DataFrame 읽기 ─────────────────────────────────────────
def read_from_minio(spark: SparkSession, bucket: str, path: str, fmt: str = "parquet") -> DataFrame:
    s3_path = f"s3a://{bucket}/{path}"

    if fmt == "parquet":
        df = spark.read.parquet(s3_path)

    elif fmt == "csv":
        df = (
            spark.read
            .option("header", "true")
            .option("inferSchema", "true")
            .csv(s3_path)
        )

    elif fmt == "json":
        df = spark.read.json(s3_path)

    elif fmt == "orc":
        df = spark.read.orc(s3_path)

    elif fmt == "avro":
        df = spark.read.format("avro").load(s3_path)

    elif fmt == "delta":
        df = spark.read.format("delta").load(s3_path)

    elif fmt == "iceberg":
        CATALOG  = "iceberg_catalog"
        DATABASE = "herb24"
        TABLE    = "detection_logs"
        iceberg_table = f"{CATALOG}.{DATABASE}.{TABLE}"

        df = spark.read.format("iceberg").load(iceberg_table)
        print(f"✅ 읽기 완료: {iceberg_table} (format=iceberg)")

    else:
        raise ValueError(f"지원하지 않는 포맷: {fmt}")

    print(f"✅ 읽기 완료: {s3_path if fmt != 'iceberg' else ''} (format={fmt})")
    print(f"   → {df.count():,}행 x {len(df.columns)}열")
    df.printSchema()
    return df


# ── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import time
    from pathlib import Path

    CSV_PATH   = str(Path(__file__).resolve().parent.parent / "herb24_100k_data.csv")
    BUCKET     = "warehouse"
    OBJECT_PATH = "herb03/herb03_100k_data"   # 디렉터리 형태로 저장됨
    FMT         = "json"   # 변경하여 테스트

    spark = create_spark_session()

    try:
        df = read_csv_as_spark_df(spark, CSV_PATH)

        t = time.time()
        write_to_minio(df, BUCKET, OBJECT_PATH, fmt=FMT)
        print(f"소요 시간: {time.time() - t:.2f}s")

        t = time.time()
        df_read = read_from_minio(spark, BUCKET, OBJECT_PATH, fmt=FMT)
        print(f"읽기 소요 시간: {time.time() - t:.2f}s")
        df_read.show(5)

    finally:
        spark.stop()