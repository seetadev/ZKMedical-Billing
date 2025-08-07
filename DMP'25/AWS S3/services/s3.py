import boto3
import os
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# S3 configuration from environment variables
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
BUCKET_NAME = os.getenv('S3_BUCKET_NAME', 'my-api-bucket')

# Create S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)


def ensure_bucket_exists():
    """Ensure the S3 bucket exists, create it if it doesn't"""
    try:
        s3_client.head_bucket(Bucket=BUCKET_NAME)
        print(f"✅ S3 bucket '{BUCKET_NAME}' exists.")
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
            try:
                s3_client.create_bucket(Bucket=BUCKET_NAME)
                print(f"✅ Created S3 bucket '{BUCKET_NAME}'.")
            except ClientError as create_error:
                print(f"❌ Failed to create S3 bucket: {create_error}")
                raise
        else:
            print(f"❌ S3 error: {e}")
            raise
