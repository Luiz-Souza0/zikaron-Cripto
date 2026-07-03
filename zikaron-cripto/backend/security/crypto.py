import os
from cryptography.fernet import Fernet

# gere uma vez: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key())"
# FERNET_KEY = os.getenv("WALLET_ENCRYPTION_KEY", "")
# if not FERNET_KEY:
#     raise RuntimeError("WALLET_ENCRYPTION_KEY não definida no ambiente.")

# _fernet = Fernet(FERNET_KEY.encode() if isinstance(FERNET_KEY, str) else FERNET_KEY)


def encrypt_secret(plain: str) -> str:
    # return _fernet.encrypt(plain.encode("utf-8")).decode("utf-8")
    pass


def decrypt_secret(token: str) -> str:
    # return _fernet.decrypt(token.encode("utf-8")).decode("utf-8")
    pass