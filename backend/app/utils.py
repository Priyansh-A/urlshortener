import hashlib
from datetime import datetime
import secrets

# creating 6 character code using base62 encoding
def base62encoding(url: str) -> str:
    timestamp = str(datetime.utcnow().timestamp())
    random_salt = secrets.token_hex(4) 
    hash_input = f"{url}{timestamp}{random_salt}".encode()
    

    hash_obj = hashlib.sha256(hash_input)
    hash_bytes = hash_obj.digest()
    

    hash_int = int.from_bytes(hash_bytes, byteorder='big')
    
    # Base62 character set
    base62_chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    
    code = ''
    temp_int = hash_int
    for _ in range(6): 
        temp_int, remainder = divmod(temp_int, 62)
        code = base62_chars[remainder] + code
    
    return code