const Question = require('../models/Question');

const calculateScore = async (quizId, answers) => {
  const questions = await Question.find({ quiz_id: quizId });
  const total = questions.length;
  let score = 0;
  const feedback = [];

  for (const q of questions) {
    const qIdStr = q._id.toString();
    const submitted = (answers[qIdStr] || '').trim().toUpperCase();
    const correct = q.correct_answer.toUpperCase();
    const isCorrect = submitted === correct;
    
    if (isCorrect) {
      score += 1;
    }
    
    feedback.push({
      question_id: qIdStr,
      question_text: q.question_text,
      submitted: submitted || null,
      correct: correct,
      is_correct: isCorrect
    });
  }

  const accuracy = total > 0 ? Number(((score / total) * 100).toFixed(1)) : 0.0;
  return {
    score,
    total_questions: total,
    accuracy,
    feedback
  };
};

module.exports = {
  calculateScore
};
