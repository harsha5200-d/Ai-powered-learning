const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');

const getSummary = async (userId) => {
  const attempts = await Attempt.find({ user_id: userId });
  const totalAttempts = attempts.length;
  if (totalAttempts === 0) {
    return {
      total_attempts: 0,
      total_quizzes: 0,
      average_accuracy: 0.0,
      best_score: 0,
      best_accuracy: 0.0
    };
  }

  const accuracies = attempts.map(a => a.accuracy);
  const scores = attempts.map(a => a.score);
  const uniqueQuizzes = new Set(attempts.map(a => a.quiz_id.toString())).size;

  const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / totalAttempts;

  return {
    total_attempts: totalAttempts,
    total_quizzes: uniqueQuizzes,
    average_accuracy: Number(avgAccuracy.toFixed(1)),
    best_score: Math.max(...scores),
    best_accuracy: Math.max(...accuracies)
  };
};

const getHistory = async (userId) => {
  const attempts = await Attempt.find({ user_id: userId }).sort({ attempted_at: 1 });
  const history = [];
  for (const a of attempts) {
    const quiz = await Quiz.findById(a.quiz_id);
    history.push({
      ...a.toDict(),
      document_id: quiz ? quiz.document_id : null
    });
  }
  return history;
};

const getTrends = async (userId) => {
  const attempts = await Attempt.find({ user_id: userId }).sort({ attempted_at: 1 });
  const trends = [];
  const rollingWindow = 5;

  for (let i = 0; i < attempts.length; i++) {
    const a = attempts[i];
    const startIndex = Math.max(0, i - rollingWindow + 1);
    const window = attempts.slice(startIndex, i + 1);
    const rollingAvg = window.reduce((sum, x) => sum + x.accuracy, 0) / window.length;

    trends.push({
      attempt_number: i + 1,
      accuracy: a.accuracy,
      score: a.score,
      total: a.total_questions,
      rolling_avg: Number(rollingAvg.toFixed(1)),
      attempted_at: a.attempted_at
    });
  }
  return trends;
};

module.exports = {
  getSummary,
  getHistory,
  getTrends
};
