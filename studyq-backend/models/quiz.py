from datetime import datetime, timezone
from models import db


class Quiz(db.Model):
    __tablename__ = "quizzes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    document_id = db.Column(db.Integer, db.ForeignKey("documents.id"), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    questions = db.relationship(
        "Question", backref="quiz", lazy=True, cascade="all, delete-orphan"
    )
    attempts = db.relationship(
        "Attempt", backref="quiz", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self, include_questions=False, hide_answers=True):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "document_id": self.document_id,
            "created_at": self.created_at.isoformat(),
            "question_count": len(self.questions),
            "attempt_count": len(self.attempts),
        }
        if include_questions:
            data["questions"] = [
                q.to_dict(hide_answer=hide_answers) for q in self.questions
            ]
        return data
