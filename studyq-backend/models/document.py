from datetime import datetime, timezone
from sqlalchemy.dialects.mysql import LONGTEXT
from models import db


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    extracted_text = db.Column(LONGTEXT, nullable=False)
    notes = db.Column(LONGTEXT, nullable=True)  # AI-generated notes
    uploaded_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    quizzes = db.relationship("Quiz", backref="document", lazy=True)

    def to_dict(self, include_text=False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "file_name": self.file_name,
            "uploaded_at": self.uploaded_at.isoformat(),
            "notes": self.notes,
            "quiz_count": len(self.quizzes),
        }
        if include_text:
            data["extracted_text"] = self.extracted_text
        return data
