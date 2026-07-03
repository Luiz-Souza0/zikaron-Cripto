from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
import datetime
import os

from models.user import UserModel
from schemas.auth import LoginSchema, UserResponse, RegisterSchema

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

JWT_SECRET  = os.getenv("JWT_SECRET", "dev-secret-troque-em-producao")
JWT_EXPIRES = 60 * 60  # 1 hora


def generate_token(user_id: int) -> str:
    payload = {
        "sub": user_id,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=JWT_EXPIRES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token não fornecido."}), 401

        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido."}), 401

        request.user_id = payload["sub"]
        return f(*args, **kwargs)
    return decorated


@auth_bp.route("/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}

    try:
        schema = LoginSchema.from_dict(body)
    except ValueError as e:
        return jsonify({"error": "Dados inválidos.", "fields": e.args[0]}), 422

    user = UserModel.find_by_email(schema.email)
    if not user or not UserModel.check_password(schema.password, user["password"]):
        return jsonify({"error": "E-mail ou senha incorretos."}), 401

    token = generate_token(user["id"])
    return jsonify({"token": token, "user": UserResponse.from_user(user).to_dict()}), 200


@auth_bp.route("/me", methods=["GET"])
@require_auth
def me():
    user = UserModel.find_by_id(request.user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado."}), 404
    return jsonify(UserResponse.from_user(user).to_dict()), 200

@auth_bp.route("/register", methods=["POST"])
def register():
    
    print("=" * 50)
    print("Content-Type:", request.content_type)
    print("Raw data:", request.get_data())
    print("JSON:", request.get_json(silent=True))
    print("=" * 50)


    body = request.get_json(silent=True) or {}

    try:
        schema = RegisterSchema.from_dict(body)
    except ValueError as e:
        return jsonify({
            "error": "Dados inválidos.",
            "fields": e.args[0]
        }), 422

    if UserModel.find_by_email(schema.email):
        return jsonify({
            "error": "Já existe um usuário com este e-mail."
        }), 409

    user = UserModel.create(
        name=schema.name,
        email=schema.email,
        password=schema.password,
        role=schema.role,
    )

    return jsonify(
        UserResponse.from_user(user).to_dict()
    ), 201