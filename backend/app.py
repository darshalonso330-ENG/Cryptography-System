"""
RSA Cryptography System — Flask Backend
Entry point: starts the development server.
"""

from flask import Flask
from flask_cors import CORS
from routes.api import api_bp


def create_app() -> Flask:
    app = Flask(__name__)

    # Allow the frontend (file:// or localhost:*) to call the API
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register the API blueprint
    app.register_blueprint(api_bp, url_prefix="/api")

    return app


if __name__ == "__main__":
    app = create_app()
    print("\n  RSA Cryptography System — Backend running")
    print("  http://127.0.0.1:5000\n")
    app.run(debug=True, host="127.0.0.1", port=5000)
