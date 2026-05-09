from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.document import Document
from services.ai_service import generate_flashcards, generate_notes
from utils.helpers import success_response, error_response

content_bp = Blueprint("content", __name__)


@content_bp.route("/notes/<int:doc_id>", methods=["GET"])
@jwt_required()
def get_notes(doc_id):
    user_id = int(get_jwt_identity())
    doc = Document.query.filter_by(id=doc_id, user_id=user_id).first()
    if not doc:
        return error_response("Document not found.", 404)
    return success_response({"notes": doc.notes or "", "file_name": doc.file_name})


@content_bp.route("/notes/<int:doc_id>/regenerate", methods=["POST"])
@jwt_required()
def regenerate_notes(doc_id):
    user_id = int(get_jwt_identity())
    doc = Document.query.filter_by(id=doc_id, user_id=user_id).first()
    if not doc:
        return error_response("Document not found.", 404)
    try:
        from models import db
        doc.notes = generate_notes(doc.extracted_text)
        db.session.commit()
        return success_response({"notes": doc.notes, "file_name": doc.file_name}, "Notes regenerated.")
    except Exception as e:
        return error_response(str(e), 500)


@content_bp.route("/flashcards/generate/<int:doc_id>", methods=["POST"])
@jwt_required()
def generate_flashcards_route(doc_id):
    user_id = int(get_jwt_identity())
    doc = Document.query.filter_by(id=doc_id, user_id=user_id).first()
    if not doc:
        return error_response("Document not found.", 404)
    try:
        cards = generate_flashcards(doc.extracted_text)
        return success_response(
            {"flashcards": cards, "file_name": doc.file_name},
            "Flashcards generated successfully.",
            201,
        )
    except ValueError as e:
        return error_response(str(e), 422)
    except RuntimeError as e:
        return error_response(str(e), 500)
