"""
Gera hash bcrypt para adicionar ao users.json.
Uso: python hash_password.py suasenha
"""
import sys
import bcrypt

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python hash_password.py <senha>")
        sys.exit(1)
    h = bcrypt.hashpw(sys.argv[1].encode(), bcrypt.gensalt(12)).decode()
    print(h)