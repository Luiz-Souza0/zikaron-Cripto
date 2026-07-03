# import hmac
# import hashlib
# import time
# import requests
# from flask import Flask, jsonify, request
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)

# BINANCE_BASE = "https://api.binance.com"

# @app.route("/api/account")
# def account():
#     api_key    = request.headers.get("X-Api-Key")
#     api_secret = request.headers.get("X-Api-Secret")
#     # OHLbo7jarzu9RNiX7IleGbaPdSRKplx5uLfqZmaTLaxnUofF0UCJADiUtIR5zSUu
#     # api_key    = "OHLbo7jarzu9RNiX7IleGbaPdSRKplx5uLfqZmaTLaxnUofF0UCJADiUtIR5zSUu"
#     # S4SgZEpb6K7kwINXg1tAKzkVDqiw9yQROhnVRg9L146FoJX19B4ZOhgQdsTzHdz7
#     # api_secret = "S4SgZEpb6K7kwINXg1tAKzkVDqiw9yQROhnVRg9L146FoJX19B4ZOhgQdsTzHdz7"

#     if not api_key or not api_secret:
#         return jsonify({"error": "Chaves não enviadas."}), 400

#     timestamp    = int(time.time() * 1000)
#     query_string = f"timestamp={timestamp}"

#     signature = hmac.new(
#         api_secret.encode("utf-8"),
#         query_string.encode("utf-8"),
#         hashlib.sha256
#     ).hexdigest()

#     url = f"{BINANCE_BASE}/api/v3/account?{query_string}&signature={signature}"

#     # try:
#     #     response = requests.get(
#     #         url,
#     #         headers={"X-MBX-APIKEY": api_key}
#     #     )

#     #     print("Status:", response.status_code)
#     #     data = response.json()
#     #     for asset in data["balances"]:
#     #         free = float(asset["free"])
#     #         locked = float(asset["locked"])

#     #         if free > 0 or locked > 0:
#     #             print(
#     #                 f"{asset['asset']}: "
#     #                 f"Livre={asset['free']} "
#     #                 f"Bloqueado={asset['locked']}"
#     #             )
#     #     print(data["balances"][0])

#     # except Exception as e:
#     #     print("Erro:", e)
#     try:
#         response = requests.get(url, headers={"X-MBX-APIKEY": api_key})
#         return jsonify(response.json()), response.status_code
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# if __name__ == "__main__":
#     # account()
#     app.run(port=3001, debug=True)



import hmac
import hashlib
import time
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.auth import auth_bp
from routes.walletRoutes import wallet_bp


from routes.auth import auth_bp

app = Flask(__name__)
CORS(app)

# ── Registra blueprints ───────────────────────────────────────────
app.register_blueprint(auth_bp)
app.register_blueprint(wallet_bp)
BINANCE_BASE = "https://api.binance.com"


# ── GET /api/account (proxy Binance) ─────────────────────────────
@app.route("/api/account")
def account():
    api_key    = request.headers.get("X-Api-Key")
    api_secret = request.headers.get("X-Api-Secret")

    if not api_key or not api_secret:
        return jsonify({"error": "Chaves não enviadas."}), 400

    timestamp    = int(time.time() * 1000)
    query_string = f"timestamp={timestamp}"

    signature = hmac.new(
        api_secret.encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    url = f"{BINANCE_BASE}/api/v3/account?{query_string}&signature={signature}"

    try:
        response = requests.get(url, headers={"X-MBX-APIKEY": api_key})
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Health check ──────────────────────────────────────────────────
@app.route("/health")
def health():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(port=3001, debug=True)