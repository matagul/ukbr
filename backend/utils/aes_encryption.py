import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

def encrypt_aes(plain_text: str, key_b64: str) -> str:
    key = base64.b64decode(key_b64)
    aesgcm = AESGCM(key)
    iv = os.urandom(12)
    ct = aesgcm.encrypt(iv, plain_text.encode('utf-8'), None)
    return f"{base64.b64encode(iv).decode()}:" \
           f"{base64.b64encode(ct).decode()}"

def decrypt_aes(cipher_text: str, key_b64: str) -> str:
    key = base64.b64decode(key_b64)
    aesgcm = AESGCM(key)
    iv_b64, ct_b64 = cipher_text.split(':')
    iv = base64.b64decode(iv_b64)
    ct = base64.b64decode(ct_b64)
    pt = aesgcm.decrypt(iv, ct, None)
    return pt.decode('utf-8') 