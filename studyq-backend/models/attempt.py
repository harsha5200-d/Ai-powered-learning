from datetime import datetime, timezone
from models import db


class Attempt(db.Model):
    __tablename__ = "attempts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    attempted_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    @property
    def accuracy(self) -> float:
        if self.total_questions == 0:
            return 0.0
        return round((self.score / self.total_questions) * 100, 1)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "quiz_id": self.quiz_id,
            "score": self.score,
            "total_questions": self.total_questions,
            "accuracy": self.accuracy,
            "attempted_at": self.attempted_at.isoformat(),
        }
