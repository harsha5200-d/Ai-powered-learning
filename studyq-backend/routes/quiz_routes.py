from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db
from models.document import Document
from models.quiz import Quiz
from models.question import Question
from models.attempt import Attempt
from services.ai_service import generate_mcqs
from services.scoring_service import calculate_score
from utils.helpers import success_response, error_response

quiz_bp = Blueprint("quiz", __name__)


@quiz_bp.route("/quiz/generate/<int:doc_id>", methods=["POST"])
@jwt_required()
def generate_quiz(doc_id):
    user_id = int(get_jwt_identity())
    doc = Document.query.filter_by(id=doc_id, user_id=user_id).first()
    if not doc:
        return error_response("Document not found.", 404)

    try:
        questions_data = generate_mcqs(doc.extracted_text)
    except ValueError as e:
        return error_response(str(e), 422)
    except RuntimeError as e:
        return error_response(str(e), 500)

    quiz = Quiz(user_id=user_id, document_id=doc_id)
    db.session.add(quiz)
    db.session.flush()  # get quiz.id before committing

    for q in questions_data:
        question = Question(
            quiz_id=quiz.id,
            question_text=q["question_text"],
            option_a=q["option_a"],
            option_b=q["option_b"],
            option_c=q["option_c"],
            option_d=q["option_d"],
            correct_answer=q["correct_answer"].upper(),
        )
        db.session.add(question)

    db.session.commit()
    return success_response(
        quiz.to_dict(include_questions=True, hide_answers=True),
        "Quiz generated successfully.",
        201,
    )


@quiz_bp.route("/quiz/<int:quiz_id>", methods=["GET"])
@jwt_required()
def get_quiz(quiz_id):
    user_id = int(get_jwt_identity())
    quiz = Quiz.query.filter_by(id=quiz_id, user_id=user_id).first()
    if not quiz:
        return error_response("Quiz not found.", 404)
    return success_response(quiz.to_dict(include_questions=True, hide_answers=True))


@quiz_bp.route("/quizzes", methods=["GET"])
@jwt_required()
def list_quizzes():
    user_id = int(get_jwt_identity())
    quizzes = (
        Quiz.query.filter_by(user_id=user_id)
        .order_by(Quiz.created_at.desc())
        .all()
    )
    return success_response([q.to_dict() for q in quizzes])


@quiz_bp.route("/quiz/<int:quiz_id>/submit", methods=["POST"])
@jwt_required()
def submit_quiz(quiz_id):
    user_id = int(get_jwt_identity())
    quiz = Quiz.query.filter_by(id=quiz_id, user_id=user_id).first()
    if not quiz:
        return error_response("Quiz not found.", 404)

    data = request.get_json(silent=True) or {}
    answers = data.get("answers")  # {question_id: "A"|"B"|"C"|"D"}
    if not answers or not isinstance(answers, dict):
        return error_response("answers must be an object mapping question_id to option.", 400)

    result = calculate_score(quiz_id, answers)

    attempt = Attempt(
        user_id=user_id,
        quiz_id=quiz_id,
        score=result["score"],
        total_questions=result["total_questions"],
    )
    db.session.add(attempt)
    db.session.commit()

    result["attempt_id"] = attempt.id
    return success_response(result, "Quiz submitted successfully.")
