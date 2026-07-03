from dataclasses import dataclass


@dataclass
class RegisterWalletSchema:
    name: str
    id: int
    key: str
    secret: str

    @classmethod
    def from_dict(cls, data: dict) -> "RegisterWalletSchema":
        errors = {}

        name = data.get("name", "")
        user_id = data.get("id")
        key = data.get("key", "").strip()
        secret = data.get("secret", "").strip()

        if not name:
            errors["name"] = "O nome é obrigatório."

        if user_id is None:
            errors["id"] = "O id do usuário é obrigatório."
        else:
            try:
                user_id = int(user_id)
            except (TypeError, ValueError):
                errors["id"] = "Id de usuário inválido."

        if not key or len(key) < 10:
            errors["key"] = "API Key inválida."

        if not secret or len(secret) < 10:
            errors["secret"] = "API Secret inválida."

        if errors:
            raise ValueError(errors)

        return cls(name=name, id=user_id, key=key, secret=secret)


@dataclass
class WalletResponse:
    id: int
    user_id: int
    name: str
    api_key: str
    api_secret: str
    created_at: str

    @classmethod
    def from_wallet(cls, wallet: dict, reveal_key: bool = False):
        return cls(
            id=wallet["id"],
            user_id=wallet["user_id"],
            name=wallet["name"],
            api_key=wallet["api_key"] if reveal_key else cls._mask(wallet["api_key"]),
            api_secret=wallet["api_secret"],
            created_at=wallet.get("created_at", ""),
        )

    @staticmethod
    def _mask(value: str) -> str:
        if not value or len(value) < 8:
            return "****"
        return f"{value[:4]}{'*' * (len(value) - 8)}{value[-4:]}"

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "api_key": self.api_key,
            "api_secret": self.api_secret,
            "created_at": self.created_at,
        }