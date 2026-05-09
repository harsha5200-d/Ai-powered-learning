from flask_jwt_extended import create_access_token
from datetime import timedelta


def generate_token(user_id: int, expires_delta=None) -> str:
    """Create a JWT access token for a given user ID."""
    if expires_delta is None:
        expires_delta = timedelta(days=30)
    return create_access_token(
        identity=str(user_id), expires_delta=expires_delta
    )
