from dataclasses import dataclass


@dataclass
class LoginSchema:
    email: str
    password: str

    @classmethod
    def from_dict(cls, data: dict) -> "LoginSchema":
        errors = {}

        email    = data.get("email", "").strip()
        password = data.get("password", "")

        if not email:
            errors["email"] = "O e-mail é obrigatório."
        elif "@" not in email or "." not in email.split("@")[-1]:
            errors["email"] = "E-mail inválido."

        if not password:
            errors["password"] = "A senha é obrigatória."
        elif len(password) < 6:
            errors["password"] = "A senha deve ter pelo menos 6 caracteres."

        if errors:
            raise ValueError(errors)

        return cls(email=email, password=password)


@dataclass
class UserResponse:
    id: int
    name: str
    email: str
    role: str

    @classmethod
    def from_user(cls, user):
        return cls(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            role=user["role"],
        )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
        }
@dataclass
class RegisterSchema:
    name: str
    email: str
    password: str
    role: str

    @classmethod
    def from_dict(cls, data: dict):
        errors = {}

        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        role = data.get("role", "standard").strip().lower()

        if not name:
            errors["name"] = "O nome é obrigatório."

        if not email:
            errors["email"] = "O e-mail é obrigatório."
        elif "@" not in email or "." not in email.split("@")[-1]:
            errors["email"] = "E-mail inválido."

        if not password:
            errors["password"] = "A senha é obrigatória."
        elif len(password) < 6:
            errors["password"] = "A senha deve ter pelo menos 6 caracteres."

        if role not in ("standard", "adm"):
            errors["role"] = "Role inválida."

        if errors:
            raise ValueError(errors)

        return cls(
            name=name,
            email=email,
            password=password,
            role=role,
        )