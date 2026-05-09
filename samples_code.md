# StudyQ Code Samples

### 1. `ai_service.py`
- **What it does:** Uses the Gemini API to parse PDF text and return strictly formatted JSON data for quizzes, flashcards, and notes.

```python
import json
import re
from google import genai
from flask import current_app

def _get_client():
    api_key = current_app.config.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")
    return genai.Client(api_key=api_key)

MODEL = "models/gemini-2.5-flash"

MCQ_PROMPT_TEMPLATE = """
You are an expert academic quiz generator.
Given the following study material, generate exactly 10 multiple-choice questions (MCQs).
Rules:
- Each question must have exactly 4 options: A, B, C, D
- Only one correct answer per question
- Academic tone, no trivial questions
- Output ONLY valid JSON — no markdown, no explanations, no extra text
- Use this exact JSON structure:
{{
  "questions": [
    {{
      "question_text": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_answer": "A"
    }}
  ]
}}
Study Material:
\"\"\"
{text}
\"\"\"
"""

NOTES_PROMPT_TEMPLATE = """
You are an expert academic note-taker.
Given the following study material, generate concise, well-structured study notes.
Rules:
- Use clear headings and bullet points
- Highlight key concepts, definitions, and important facts
- Keep notes academically rigorous but easy to understand
- Aim for 300-500 words
- Output plain text only (no markdown code blocks)
Study Material:
\"\"\"
{text}
\"\"\"
"""

FLASHCARDS_PROMPT_TEMPLATE = """
You are an expert academic flashcard creator.
Given the following study material, generate exactly 10 flashcards.
Rules:
- Each flashcard has a "front" (a question or key term) and a "back" (the answer or definition)
- Keep fronts concise (max 15 words), backs informative (max 50 words)
- Cover the most important concepts from the material
- Output ONLY valid JSON — no markdown, no explanations, no extra text
- Use this exact JSON structure:
{{
  "flashcards": [
    {{
      "front": "...",
      "back": "..."
    }}
  ]
}}
Study Material:
\"\"\"
{text}
\"\"\"
"""

def _extract_json(raw: str) -> dict:
    cleaned = re.sub(r"```(?:json)?", "", raw).strip()
    cleaned = cleaned.rstrip("`").strip()
    return json.loads(cleaned)

def _generate(prompt: str) -> str:
    client = _get_client()
    response = client.models.generate_content(model=MODEL, contents=prompt)
    return response.text.strip()

def generate_mcqs(text: str) -> list[dict]:
    prompt = MCQ_PROMPT_TEMPLATE.format(text=text[:12000])
    raw = _generate(prompt)
    try:
        data = _extract_json(raw)
        questions = data.get("questions", [])
        if not questions:
            raise ValueError("Empty questions list in AI response.")
        required_keys = { "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer" }
        for q in questions:
            missing = required_keys - q.keys()
            if missing:
                raise ValueError(f"Question missing keys: {missing}")
            if q["correct_answer"].upper() not in {"A", "B", "C", "D"}:
                raise ValueError(f"Invalid correct_answer: {q['correct_answer']}")
        return questions
    except (json.JSONDecodeError, KeyError) as e:
        raise ValueError(f"Failed to parse AI response: {e}") from e

def generate_notes(text: str) -> str:
    prompt = NOTES_PROMPT_TEMPLATE.format(text=text[:12000])
    return _generate(prompt)

def generate_flashcards(text: str) -> list[dict]:
    prompt = FLASHCARDS_PROMPT_TEMPLATE.format(text=text[:12000])
    raw = _generate(prompt)
    try:
        data = _extract_json(raw)
        cards = data.get("flashcards", [])
        if not cards:
            raise ValueError("Empty flashcards list in AI response.")
        for card in cards:
            if "front" not in card or "back" not in card:
                raise ValueError("Flashcard missing 'front' or 'back' key.")
        return cards
    except (json.JSONDecodeError, KeyError) as e:
        raise ValueError(f"Failed to parse AI response: {e}") from e
```

---

### 2. `pdf_service.py`
- **What it does:** Extracts and combines the raw readable text from the uploaded PDF byte stream directly in memory.

```python
import fitz

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    text_parts = []
    try:
        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            for page in doc:
                text_parts.append(page.get_text("text"))
    except Exception as e:
        print(f"Error reading PDF with PyMuPDF: {e}")
        return "" 
    return "\n".join(text_parts).strip()
```

---

### 3. `upload_routes.py`
- **What it does:** Provides the API endpoint to securely handle incoming PDF file uploads, extract its text, asynchronously generate AI notes, and store the record in the database.

```python
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

    try:
        extracted_text = extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        return error_response(f"Failed to process PDF: {str(e)}", 422)

    if not extracted_text or len(extracted_text.strip()) < 50:
        return error_response(
            "The uploaded PDF does not contain enough readable text. "
            "Please ensure it is a text-based document and not just scanned images.", 
            422
        )

    notes = None
    try:
        notes = generate_notes(extracted_text)
    except Exception:
        pass

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
```
