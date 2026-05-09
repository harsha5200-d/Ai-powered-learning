from flask import Blueprint, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from models import db
from models.document import Document
from services.pdf_service import extract_text_from_pdf
from services.ai_service import generate_notes
from utils.helpers import success_response, error_response, allowed_file

upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_document():
    user_id = int(get_jwt_identity())

    if "file" not in request.files:
        return error_response("No file part in the request.", 400)

    file = request.files["file"]
    if file.filename == "":
        return error_response("No file selected.", 400)

    allowed = current_app.config["ALLOWED_EXTENSIONS"]
    if not allowed_file(file.filename, allowed):
        return error_response("Only PDF files are allowed.", 400)

    filename = secure_filename(file.filename)
    pdf_bytes = file.read()

    # Extract text
    try:
        extracted_text = extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        return error_response(f"Failed to process PDF: {str(e)}", 422)

    # Require at least 50 characters to ensure it's not just a scanned image or empty
    if not extracted_text or len(extracted_text.strip()) < 50:
        return error_response(
            "The uploaded PDF does not contain enough readable text. "
            "Please ensure it is a text-based document and not just scanned images.", 
            422
        )

    # Generate notes asynchronously in background (best-effort)
    notes = None
    try:
        notes = generate_notes(extracted_text)
    except Exception:
        pass  # Notes are optional; won't block upload

    doc = Document(
        user_id=user_id,
        file_name=filename,
        extracted_text=extracted_text,
        notes=notes,
    )
    db.session.add(doc)
    db.session.commit()

    return success_response(doc.to_dict(), "Document uploaded successfully.", 201)


@upload_bp.route("/documents", methods=["GET"])
@jwt_required()
def list_documents():
    user_id = int(get_jwt_identity())
    docs = (
        Document.query.filter_by(user_id=user_id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )
    return success_response([d.to_dict() for d in docs])


@upload_bp.route("/documents/<int:doc_id>", methods=["GET"])
@jwt_required()
def get_document(doc_id):
    user_id = int(get_jwt_identity())
    doc = Document.query.filter_by(id=doc_id, user_id=user_id).first()
    if not doc:
        return error_response("Document not found.", 404)
    return success_response(doc.to_dict(include_text=True))
