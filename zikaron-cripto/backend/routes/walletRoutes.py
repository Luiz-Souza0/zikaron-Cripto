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


def get_simple_earn_flexible_positions(api_key: str, api_secret: str, asset: str = None):
    """
    Busca as posições do Simple Earn (Flexible) na Binance, incluindo
    o principal + rendimentos já acumulados (campo totalAmount).

    Endpoint: GET /sapi/v1/simple-earn/flexible/position
    Docs: https://developers.binance.com/docs/simple_earn/account/Get-Flexible-Product-Position
    """
    timestamp = int(time.time() * 1000)
    params = {"timestamp": timestamp}
    if asset:
        params["asset"] = asset

    query_string = "&".join(f"{k}={v}" for k, v in params.items())

    signature = hmac.new(
        api_secret.encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    url = f"{BINANCE_BASE}/sapi/v1/simple-earn/flexible/position?{query_string}&signature={signature}"

    try:
        resp = requests.get(url, headers={"X-MBX-APIKEY": api_key}, timeout=10)
        data = resp.json()
        if resp.status_code != 200:
            return False, data
        # a API retorna paginado: {"rows": [...], "total": N}
        return True, data.get("rows", [])
    except requests.RequestException as e:
        return False, {"error": str(e)}


def merge_spot_and_earn_balances(spot_balances: list, earn_positions: list):
    """
    Soma o saldo do Simple Earn (Flexible) ao saldo Spot do mesmo ativo,
    usando o campo totalAmount do Earn (que já inclui os juros acumulados).

    Ex: PEPE (spot) + LDPEPE.totalAmount (earn, com juros) -> PEPE "efetivo"
    """
    earn_by_asset = {}
    for position in earn_positions:
        asset = position.get("asset")
        total_amount = float(position.get("totalAmount", 0) or 0)
        earn_by_asset[asset] = earn_by_asset.get(asset, 0) + total_amount

    merged = []
    for balance in spot_balances:
        asset = balance["asset"]
        free = float(balance.get("free", 0) or 0)
        locked = float(balance.get("locked", 0) or 0)
        earn_amount = earn_by_asset.pop(asset, 0)

        merged.append({
            "asset": asset,
            "free": free,
            "locked": locked,
            "earn": earn_amount,
            "total": free + locked + earn_amount,
        })

    # ativos que só existem no Earn (ex: só tem LDPEPE, sem linha PEPE "solta")
    for asset, earn_amount in earn_by_asset.items():
        merged.append({
            "asset": asset,
            "free": 0.0,
            "locked": 0.0,
            "earn": earn_amount,
            "total": earn_amount,
        })

    return merged


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
        
    print(f"\n\nvalores de binance_response: {binance_response}")

    # busca as posições do Simple Earn (Flexible) pra pegar o saldo já
    # com os juros acumulados (ex: LDPEPE, LDUSDT, LDNEAR, etc.)
    earn_ok, earn_positions = get_simple_earn_flexible_positions(
        wallet["api_key"], api_secret
    )
    if not earn_ok:
        print(f"Aviso: não foi possível buscar posições do Simple Earn: {earn_positions}")
        earn_positions = []

    spot_balances = binance_response.get("balances", [])
    merged_balances = merge_spot_and_earn_balances(spot_balances, earn_positions)

    return jsonify({
        "wallet": WalletResponse.from_wallet(wallet, True).to_dict(),
        "valid": True,
        "account": binance_response,
        "balances_merged": merged_balances,
    }), 200