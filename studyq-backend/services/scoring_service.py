from models.question import Question


def calculate_score(quiz_id: int, answers: dict) -> dict:
    """
    Compare submitted answers to correct answers.

    Parameters
    ----------
    quiz_id : int
    answers : dict  {question_id (str/int): chosen_option (str 'A'|'B'|'C'|'D')}

    Returns
    -------
    dict with score, total, accuracy, and per-question feedback
    """
    questions = Question.query.filter_by(quiz_id=quiz_id).all()
    total = len(questions)
    score = 0
    feedback = []

    for q in questions:
        submitted = answers.get(str(q.id), "").strip().upper()
        correct = q.correct_answer.upper()
        is_correct = submitted == correct
        if is_correct:
            score += 1
        feedback.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "submitted": submitted or None,
            "correct": correct,
            "is_correct": is_correct,
        })

    accuracy = round((score / total) * 100, 1) if total > 0 else 0.0
    return {
        "score": score,
        "total_questions": total,
        "accuracy": accuracy,
        "feedback": feedback,
    }
