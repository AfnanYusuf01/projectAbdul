import os
import base64
import time
import hashlib
from datetime import datetime
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Paths for persisting RSA keys (always in backend directory)
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRIVATE_KEY_PATH = os.path.join(_BACKEND_DIR, "private_key.pem")
PUBLIC_KEY_PATH = os.path.join(_BACKEND_DIR, "public_key.pem")

def get_or_generate_rsa_keys():
    """
    Loads existing RSA keys or generates a new RSA-2048 pair if they do not exist.
    """
    if os.path.exists(PRIVATE_KEY_PATH) and os.path.exists(PUBLIC_KEY_PATH):
        with open(PRIVATE_KEY_PATH, "rb") as f:
            private_key = serialization.load_pem_private_key(
                f.read(),
                password=None
            )
        with open(PUBLIC_KEY_PATH, "rb") as f:
            public_key = serialization.load_pem_public_key(
                f.read()
            )
        return private_key, public_key
    else:
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        public_key = private_key.public_key()
        
        pem_private = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        with open(PRIVATE_KEY_PATH, "wb") as f:
            f.write(pem_private)
            
        pem_public = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        with open(PUBLIC_KEY_PATH, "wb") as f:
            f.write(pem_public)
            
        return private_key, public_key

private_key, public_key = get_or_generate_rsa_keys()

def encrypt_payload(plaintext: str) -> dict:
    """
    Encrypts a plaintext string using the AES-256-GCM + RSA Hybrid Cryptosystem.
    """
    aes_key = AESGCM.generate_key(bit_length=256)
    iv = os.urandom(12)
    
    aesgcm = AESGCM(aes_key)
    ciphertext_with_tag = aesgcm.encrypt(iv, plaintext.encode('utf-8'), None)
    
    tag_size = 16
    ciphertext = ciphertext_with_tag[:-tag_size]
    tag = ciphertext_with_tag[-tag_size:]
    
    encrypted_key = public_key.encrypt(
        aes_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    return {
        "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
        "iv": base64.b64encode(iv).decode('utf-8'),
        "tag": base64.b64encode(tag).decode('utf-8'),
        "encrypted_session_key": base64.b64encode(encrypted_key).decode('utf-8')
    }

def decrypt_payload(encrypted_session_key_b64: str, ciphertext_b64: str, iv_b64: str, tag_b64: str) -> str:
    """
    Decrypts an encrypted payload using the Private RSA key and the encrypted AES session key.
    """
    encrypted_key = base64.b64decode(encrypted_session_key_b64)
    ciphertext = base64.b64decode(ciphertext_b64)
    iv = base64.b64decode(iv_b64)
    tag = base64.b64decode(tag_b64)
    
    aes_key = private_key.decrypt(
        encrypted_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    ciphertext_with_tag = ciphertext + tag
    
    aesgcm = AESGCM(aes_key)
    decrypted_bytes = aesgcm.decrypt(iv, ciphertext_with_tag, None)
    
    return decrypted_bytes.decode('utf-8')

def rotate_rsa_keys() -> dict:
    """
    Rotates the active RSA-2048 keypair, saving new keys to disk and updating in-memory references.
    """
    global private_key, public_key
    new_private = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )
    new_public = new_private.public_key()
    
    pem_private = new_private.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    with open(PRIVATE_KEY_PATH, "wb") as f:
        f.write(pem_private)
        
    pem_public = new_public.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    with open(PUBLIC_KEY_PATH, "wb") as f:
        f.write(pem_public)
        
    private_key = new_private
    public_key = new_public
    
    fp = hashlib.sha256(pem_public).hexdigest()[:16]
    return {
        "status": "KEY_ROTATED_SUCCESS",
        "key_algorithm": "RSA-2048",
        "key_fingerprint": f"SHA256:{fp}",
        "rotated_at": datetime.utcnow().isoformat()
    }

def simulate_tampering_attack(plaintext: str) -> dict:
    """
    Encrypts payload, tampers with 1 byte in ciphertext, and proves AES-GCM tag verification failure.
    """
    start_time = time.perf_counter()
    enc_res = encrypt_payload(plaintext)
    
    # Alter 1 byte in ciphertext
    raw_cipher = bytearray(base64.b64decode(enc_res["ciphertext"]))
    if len(raw_cipher) > 0:
        raw_cipher[0] ^= 0xFF  # Flip bits
    tampered_ciphertext = base64.b64encode(raw_cipher).decode('utf-8')
    
    tamper_detected = False
    try:
        decrypt_payload(enc_res["encrypted_session_key"], tampered_ciphertext, enc_res["iv"], enc_res["tag"])
    except Exception:
        tamper_detected = True
        
    duration_ms = (time.perf_counter() - start_time) * 1000.0
    return {
        "original_plaintext": plaintext,
        "original_ciphertext": enc_res["ciphertext"],
        "tampered_ciphertext": tampered_ciphertext,
        "iv": enc_res["iv"],
        "tag": enc_res["tag"],
        "tampered_byte_index": 0,
        "tamper_detected": tamper_detected,
        "security_status": "BLOCKED_INTEGRITY_VIOLATION" if tamper_detected else "FAILED_DETECTION",
        "security_message": "[SECURITY ALERT] Authentication Tag Mismatch: Data telah dimanipulasi saat transmisi. Dekripsi ditolak seketika oleh AES-GCM.",
        "detection_latency_ms": round(duration_ms, 3)
    }

def benchmark_cryptography(payload_size_kb: int = 1) -> dict:
    """
    Benchmarks pure AES-256, pure RSA-2048, and Hybrid AES-RSA for thesis empirical evaluation.
    """
    size_bytes = max(1, payload_size_kb) * 1024
    test_payload = "A" * size_bytes
    payload_bytes = test_payload.encode('utf-8')
    iterations = 25
    
    # 1. Pure AES-256-GCM
    aes_key = AESGCM.generate_key(bit_length=256)
    aesgcm = AESGCM(aes_key)
    iv = os.urandom(12)
    t0 = time.perf_counter()
    for _ in range(iterations):
        c = aesgcm.encrypt(iv, payload_bytes, None)
        aesgcm.decrypt(iv, c, None)
    avg_aes_ms = ((time.perf_counter() - t0) * 1000.0) / iterations
    
    # 2. Pure RSA-2048 (max 190 bytes per OAEP-SHA256 chunk)
    rsa_chunk = test_payload[:190].encode('utf-8')
    t0 = time.perf_counter()
    for _ in range(iterations):
        c = public_key.encrypt(
            rsa_chunk,
            padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
        )
        private_key.decrypt(
            c,
            padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
        )
    avg_rsa_ms = ((time.perf_counter() - t0) * 1000.0) / iterations
    
    # 3. Hybrid AES-RSA on full payload
    t0 = time.perf_counter()
    last_res = None
    for _ in range(iterations):
        last_res = encrypt_payload(test_payload)
        decrypt_payload(last_res["encrypted_session_key"], last_res["ciphertext"], last_res["iv"], last_res["tag"])
    avg_hybrid_ms = ((time.perf_counter() - t0) * 1000.0) / iterations
    
    aes_tps = round(1000.0 / avg_aes_ms, 1) if avg_aes_ms > 0 else 0
    hybrid_tps = round(1000.0 / avg_hybrid_ms, 1) if avg_hybrid_ms > 0 else 0
    rsa_tps = round(1000.0 / avg_rsa_ms, 1) if avg_rsa_ms > 0 else 0
    
    return {
        "payload_size_kb": payload_size_kb,
        "payload_size_bytes": size_bytes,
        "aes_time_ms": round(avg_aes_ms, 3),
        "rsa_time_ms": round(avg_rsa_ms, 3),
        "hybrid_time_ms": round(avg_hybrid_ms, 3),
        "aes_throughput_tps": aes_tps,
        "hybrid_throughput_tps": hybrid_tps,
        "rsa_throughput_tps": rsa_tps,
        "ciphertext_size_bytes": len(last_res["ciphertext"]) if last_res else size_bytes,
        "iterations": iterations
    }
