"""
RSA Cryptography System — API Routes
All mathematical logic is copied verbatim from the original Python desktop app.
No algorithm has been changed.
"""

from flask import Blueprint, request, jsonify

api_bp = Blueprint("api", __name__)


# ══════════════════════════════════════════════════════════════════════════════
#  CORE MATH  (identical to the original NumberTheoryApp methods)
# ══════════════════════════════════════════════════════════════════════════════

def extended_gcd(a: int, b: int) -> tuple[int, int, int]:
    """Extended Euclidean algorithm — returns (gcd, x, y)."""
    if a == 0:
        return b, 0, 1
    gcd, x1, y1 = extended_gcd(b % a, a)
    return gcd, y1 - (b // a) * x1, x1


def rsa_process_text(text: str, e_or_d: int, n: int) -> str:
    """Apply RSA to every letter; non-alpha chars pass through unchanged."""
    result = ""
    for char in text.upper():
        if char.isalpha():
            m        = ord(char) - 64          # A=1 … Z=26
            res_val  = pow(m, e_or_d, n)
            char_val = res_val % 26 or 26
            result  += chr(char_val + 64)
        else:
            result += char
    return result


def affine_process(text: str, is_enc: bool) -> str:
    """Affine cipher with fixed a=3, b=9 (encrypt) / a=9, b=-3 (decrypt)."""
    res = ""
    for char in text.upper():
        if char.isalpha():
            a   = ord(char) - 64
            val = (3 * a + 9) % 26 if is_enc else (9 * a - 3) % 26
            if val == 0:
                val = 26
            res += chr(val + 64)
        else:
            res += char
    return res


# ══════════════════════════════════════════════════════════════════════════════
#  RSA ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

def _parse_rsa_params(data: dict) -> tuple[int, int, int]:
    """Extract and validate p, q, e from request JSON."""
    try:
        p = int(data["p"])
        q = int(data["q"])
        e = int(data["e"])
    except (KeyError, ValueError, TypeError):
        raise ValueError("p, q and e must be integers.")
    return p, q, e


@api_bp.route("/rsa/compute-keys", methods=["POST"])
def rsa_compute_keys():
    """
    Compute RSA key parameters.
    Body:  { "p": int, "q": int, "e": int }
    Returns: { "n": int, "phi": int, "d": int }
    """
    data = request.get_json(force=True) or {}
    try:
        p, q, e = _parse_rsa_params(data)
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    n   = p * q
    phi = (p - 1) * (q - 1)
    _, d, _ = extended_gcd(e, phi)
    d = d % phi

    return jsonify({"n": n, "phi": phi, "d": d})


@api_bp.route("/rsa/encrypt", methods=["POST"])
def rsa_encrypt():
    """
    RSA encryption.
    Body:  { "p": int, "q": int, "e": int, "text": str }
    Returns: { "result": str, "n": int, "phi": int, "warning": str|null }
    """
    data = request.get_json(force=True) or {}
    try:
        p, q, e = _parse_rsa_params(data)
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"error": "text must not be empty."}), 400

    n   = p * q
    phi = (p - 1) * (q - 1)

    warning = None
    if n <= 26:
        warning = "n must be > 26 for full alphabet mapping."

    cipher = rsa_process_text(text, e, n)
    return jsonify({"result": cipher, "n": n, "phi": phi, "warning": warning})


@api_bp.route("/rsa/decrypt", methods=["POST"])
def rsa_decrypt():
    """
    RSA decryption.
    Body:  { "p": int, "q": int, "e": int, "text": str }
    Returns: { "result": str, "n": int, "phi": int, "d": int }
    """
    data = request.get_json(force=True) or {}
    try:
        p, q, e = _parse_rsa_params(data)
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"error": "text must not be empty."}), 400

    n   = p * q
    phi = (p - 1) * (q - 1)
    _, d, _ = extended_gcd(e, phi)
    d = d % phi

    plain = rsa_process_text(text, d, n)
    return jsonify({"result": plain, "n": n, "phi": phi, "d": d})


# ══════════════════════════════════════════════════════════════════════════════
#  AFFINE ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@api_bp.route("/affine/encrypt", methods=["POST"])
def affine_encrypt():
    """
    Affine cipher encryption (fixed a=3, b=9).
    Body:  { "text": str }
    Returns: { "result": str }
    """
    data = request.get_json(force=True) or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"error": "text must not be empty."}), 400

    return jsonify({"result": affine_process(text, is_enc=True)})


@api_bp.route("/affine/decrypt", methods=["POST"])
def affine_decrypt():
    """
    Affine cipher decryption (fixed a=9, b=-3).
    Body:  { "text": str }
    Returns: { "result": str }
    """
    data = request.get_json(force=True) or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"error": "text must not be empty."}), 400

    return jsonify({"result": affine_process(text, is_enc=False)})


# ── Health check ──────────────────────────────────────────────────────────────
@api_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "RSA Cryptography System"})
