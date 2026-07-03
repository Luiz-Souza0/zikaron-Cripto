import hmac
import hashlib
import time
import requests
from flask import Blueprint, request, jsonify

from models.binanceWallet import WalletModel
from schemas.binanceWallet import RegisterWalletSchema, WalletResponse
from security.crypto import encrypt_secret, decrypt_secret

wallet_bp = Blueprint("wallet", __name__, url_prefix="/auth")

BINANCE_BASE = "https://api.binance.com"


def validate_binance_credentials(api_key: str, api_secret: str):
    """Confere se a key/secret realmente autenticam na Binance."""
    timestamp = int(time.time() * 1000)
    query_string = f"timestamp={timestamp}"

    signature = hmac.new(
        api_secret.encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    url = f"{BINANCE_BASE}/api/v3/account?{query_string}&signature={signature}"

    try:
        resp = requests.get(url, headers={"X-MBX-APIKEY": api_key}, timeout=10)
        return resp.status_code == 200, resp.json()
    except requests.RequestException as e:
        return False, {"error": str(e)}


# ── POST /auth/registerBinanceWallet ──────────────────────────────
@wallet_bp.route("/registerBinanceWallet", methods=["POST"])
def register_binance_wallet():
    body = request.get_json(silent=True) or {}
    print("register_binance_wallet body:", body)
    
    try:
        schema = RegisterWalletSchema.from_dict(body)
    except ValueError as e:
        return jsonify({"error": "Dados inválidos.", "fields": e.args[0]}), 422

    # valida direto na Binance antes de salvar
    is_valid, binance_response = validate_binance_credentials(schema.key, schema.secret)
    if not is_valid:
        return jsonify({
            "error": "Não foi possível validar as chaves na Binance.",
            "details": binance_response,
        }), 400

    existing = WalletModel.find_by_user_and_key(schema.id, schema.key)
    if existing:
        return jsonify({"error": "Essa carteira já está cadastrada."}), 409

    wallet = WalletModel.create(
        user_id=schema.id,
        name=schema.name,
        api_key=schema.key,
        api_secret_encrypted=schema.secret,
    )

    return jsonify(WalletResponse.from_wallet(wallet).to_dict()), 201


# ── GET /auth/getBinanceWallet/<user_id> (validado) ───────────────
@wallet_bp.route("/getBinanceWallet/<int:user_id>", methods=["GET"])
def get_binance_wallet(user_id):
    wallet = WalletModel.find_by_user_id(user_id)
    if not wallet:
        return jsonify({"error": "Nenhuma carteira encontrada para esse usuário."}), 404

    api_secret = wallet["api_secret"]
    
    print(f"Validando chaves para usuário {user_id}...")

    print(f"Chaves salvas: api_key={wallet['api_key']}, api_secret={api_secret}")
    
    is_valid, binance_response = validate_binance_credentials(wallet["api_key"], api_secret)
    if not is_valid:
        return jsonify({
            "error": "As chaves salvas não são mais válidas na Binance.",
            "details": binance_response,
        }), 400

    return jsonify({
        "wallet": WalletResponse.from_wallet(wallet, True).to_dict(),
        "valid": True,
        "account": binance_response,
    }), 200