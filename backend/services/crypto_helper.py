import os
import base64
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Paths for persisting RSA keys
PRIVATE_KEY_PATH = "private_key.pem"
PUBLIC_KEY_PATH = "public_key.pem"

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
