from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db
from models.user import User
from utils.helpers import success_response, error_response, validate_email, validate_password
from utils.jwt_utils import generate_token

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    # Validation
    errors = {}
    if not username or len(username) < 3:
        errors["username"] = "Username must be at least 3 characters."
    if not validate_email(email):
        errors["email"] = "Invalid email address."
    valid_pwd, pwd_msg = validate_password(password)
    if not valid_pwd:
        errors["password"] = pwd_msg
    if errors:
        return error_response("Validation failed.", 422, errors)

    # Uniqueness check
    if User.query.filter_by(email=email).first():
        return error_response("Email already registered.", 409)
    if User.query.filter_by(username=username).first():
        return error_response("Username already taken.", 409)

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id)
    return success_response(
        {"user": user.to_dict(), "token": token},
        "Registration successful.",
        201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return error_response("Email and password are required.", 400)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error_response("Invalid email or password.", 401)

    token = generate_token(user.id)
    return success_response(
        {"user": user.to_dict(), "token": token},
        "Login successful.",
    )


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found.", 404)
    return success_response(user.to_dict())
