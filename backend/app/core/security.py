import hashlib
import hmac
import os
from typing import Optional

def hash_password(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256 with a cryptographically secure 16-byte salt.
    Format: salt_hex$dk_hex
    """
    if not password:
        raise ValueError("Password cannot be empty.")
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return f"{salt.hex()}${dk.hex()}"

def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    """
    Verify a plaintext password against a stored hash.
    Safe against timing attacks via hmac.compare_digest.
    """
    if not plain_password or not hashed_password or "$" not in hashed_password:
        return False
    try:
        salt_hex, dk_hex = hashed_password.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        test_dk = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100_000)
        return hmac.compare_digest(dk_hex, test_dk.hex())
    except Exception:
        return False
