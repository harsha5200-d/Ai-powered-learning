from models.attempt import Attempt
from models.quiz import Quiz


def get_summary(user_id: int) -> dict:
    """Overall performance summary for a user."""
    attempts = Attempt.query.filter_by(user_id=user_id).all()
    total_attempts = len(attempts)
    if total_attempts == 0:
        return {
            "total_attempts": 0,
            "total_quizzes": 0,
            "average_accuracy": 0.0,
            "best_score": 0,
            "best_accuracy": 0.0,
        }

    accuracies = [a.accuracy for a in attempts]
    scores = [a.score for a in attempts]
    unique_quizzes = len({a.quiz_id for a in attempts})

    return {
        "total_attempts": total_attempts,
        "total_quizzes": unique_quizzes,
        "average_accuracy": round(sum(accuracies) / total_attempts, 1),
        "best_score": max(scores),
        "best_accuracy": max(accuracies),
    }


def get_history(user_id: int) -> list[dict]:
    """Ordered attempt history for chart rendering."""
    attempts = (
        Attempt.query.filter_by(user_id=user_id)
        .order_by(Attempt.attempted_at.asc())
        .all()
    )
    history = []
    for a in attempts:
        quiz = Quiz.query.get(a.quiz_id)
        history.append({
            **a.to_dict(),
            "document_id": quiz.document_id if quiz else None,
        })
    return history


def get_trends(user_id: int) -> list[dict]:
    """
    Rolling average accuracy trend for the last N attempts.
    Returns list of {attempt_number, accuracy, rolling_avg}.
    """
    attempts = (
        Attempt.query.filter_by(user_id=user_id)
        .order_by(Attempt.attempted_at.asc())
        .all()
    )
    trends = []
    rolling_window = 5
    for i, a in enumerate(attempts):
        window = attempts[max(0, i - rolling_window + 1): i + 1]
        rolling_avg = round(
            sum(x.accuracy for x in window) / len(window), 1
        )
        trends.append({
            "attempt_number": i + 1,
            "accuracy": a.accuracy,
            "score": a.score,
            "total": a.total_questions,
            "rolling_avg": rolling_avg,
            "attempted_at": a.attempted_at.isoformat(),
        })
    return trends
