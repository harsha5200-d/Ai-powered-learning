from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from services.analytics_service import get_summary, get_history, get_trends
from utils.helpers import success_response

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/summary", methods=["GET"])
@jwt_required()
def summary():
    user_id = int(get_jwt_identity())
    return success_response(get_summary(user_id))


@analytics_bp.route("/history", methods=["GET"])
@jwt_required()
def history():
    user_id = int(get_jwt_identity())
    return success_response(get_history(user_id))


@analytics_bp.route("/trends", methods=["GET"])
@jwt_required()
def trends():
    user_id = int(get_jwt_identity())
    return success_response(get_trends(user_id))
