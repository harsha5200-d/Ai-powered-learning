from flask import jsonify
import re


def success_response(data=None, message="Success", status_code=200):
    """Standard success JSON response."""
    resp = {"success": True, "message": message}
    if data is not None:
        resp["data"] = data
    return jsonify(resp), status_code


def error_response(message="An error occurred", status_code=400, errors=None):
    """Standard error JSON response."""
    resp = {"success": False, "message": message}
    if errors:
        resp["errors"] = errors
    return jsonify(resp), status_code


def validate_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email))


def validate_password(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    return True, ""


def allowed_file(filename: str, allowed: set) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed
