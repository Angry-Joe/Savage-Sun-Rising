import os
import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class AwsCredentials:
    access_key_id: str
    secret_access_key: str


def ShowId() -> Optional[AwsCredentials]:
    file_path = os.path.join(os.path.expanduser("~"), ".aws", "credentials")

    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return None

    with open(file_path, "r") as f:
        content = f.read()

    key_match    = re.search(r"aws_access_key_id\s*=\s*(?P<value>[A-Za-z0-9]+)",  content, re.IGNORECASE)
    secret_match = re.search(r"aws_secret_access_key\s*=\s*(?P<value>.+)$",       content, re.IGNORECASE | re.MULTILINE)

    if not key_match or not secret_match:
        print("❌ No keys detected")
        return None

    return AwsCredentials(
        access_key_id=key_match.group("value").strip(),
        secret_access_key=secret_match.group("value").strip()
    )


if __name__ == "__main__":
    creds = ShowId()
    if creds:
        print(f"Access Key ID:     {creds.access_key_id}")
        print(f"Secret Access Key: {creds.secret_access_key}")
