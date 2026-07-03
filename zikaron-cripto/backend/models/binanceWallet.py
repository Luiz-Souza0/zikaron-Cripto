import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "wallets.json")


class WalletModel:

    @staticmethod
    def _load() -> list[dict]:
        if not os.path.exists(DB_PATH):
            return []
        with open(DB_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def _save(wallets: list):
        with open(DB_PATH, "w", encoding="utf-8") as f:
            json.dump(wallets, f, indent=2, ensure_ascii=False)

    @staticmethod
    def find_by_user_id(user_id: int) -> dict | None:
        wallets = WalletModel._load()
        return next((w for w in wallets if w["user_id"] == user_id), None)

    @staticmethod
    def find_by_user_and_key(user_id: int, api_key: str) -> dict | None:
        wallets = WalletModel._load()
        return next(
            (w for w in wallets if w["user_id"] == user_id and w["api_key"] == api_key),
            None,
        )

    @staticmethod
    def create(user_id: int, name: str, api_key: str, api_secret_encrypted: str) -> dict:
        wallets = WalletModel._load()

        next_id = max((w["id"] for w in wallets), default=0) + 1

        import datetime
        wallet = {
            "id": next_id,
            "user_id": user_id,
            "name": name,
            "api_key": api_key,
            "api_secret": api_secret_encrypted,
            "created_at": datetime.datetime.utcnow().isoformat(),
        }

        wallets.append(wallet)
        WalletModel._save(wallets)

        return wallet