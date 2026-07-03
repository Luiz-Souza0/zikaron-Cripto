import json
import os
import bcrypt

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "users.json")


class UserModel:

    @staticmethod
    def _load() -> list[dict]:
        with open(DB_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def find_by_email(email: str) -> dict | None:
        users = UserModel._load()
        return next((u for u in users if u["email"] == email), None)

    @staticmethod
    def find_by_id(user_id: int) -> dict | None:
        users = UserModel._load()
        return next((u for u in users if u["id"] == user_id), None)

    @staticmethod
    def check_password(plain: str, hashed: str) -> bool:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

    @staticmethod
    def hash_password(plain: str) -> str:
        return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")
    
    @staticmethod
    def _save(users: list):
        with open(DB_PATH, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2, ensure_ascii=False)


    @staticmethod
    def create(name: str, email: str, password: str, role: str):
        users = UserModel._load()

        if any(u["email"] == email for u in users):
            return None

        next_id = max((u["id"] for u in users), default=0) + 1

        user = {
            "id": next_id,
            "name": name,
            "email": email,
            "password": UserModel.hash_password(password),
            "role": role,
        }

        users.append(user)

        UserModel._save(users)

        return user