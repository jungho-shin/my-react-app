import time
from pathlib import Path

import boto3
from botocore.config import Config


def load_data_to_minio(csv_path):
    # MinIO 클라이언트 설정
    s3 = boto3.client(
        "s3",
        endpoint_url="http://localhost:9000",
        aws_access_key_id="minioadmin",
        aws_secret_access_key="minioadmin",
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",  # MinIO는 region 무관, 임의값
    )

    BUCKET_NAME = "warehouse"
    OBJECT_NAME = "herb24_100k_data.csv"  # MinIO 내 저장 경로

    # 버킷 없으면 생성
    existing = [b["Name"] for b in s3.list_buckets()["Buckets"]]
    if BUCKET_NAME not in existing:
        s3.create_bucket(Bucket=BUCKET_NAME)
        print(f"버킷 생성: {BUCKET_NAME}")

    # 업로드
    n_start_time = time.time()
    s3.upload_file(csv_path, BUCKET_NAME, OBJECT_NAME)
    n_end_time = time.time()
    print(f"업로드 완료: s3://{BUCKET_NAME}/{OBJECT_NAME} : {n_end_time -n_start_time }")


if __name__ == "__main__":
    script_dir   = Path(__file__).resolve().parent.parent
    csv_filename = script_dir / "herb24_100k_data.csv"

    if csv_filename.exists():
        load_data_to_minio(csv_filename)
    else:
        print(f"❌ 에러: CSV 파일을 찾을 수 없습니다. 경로: {csv_filename}")