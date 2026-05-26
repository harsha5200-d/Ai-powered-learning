const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  total_questions: { type: Number, required: true },
  attempted_at: { type: Date, default: Date.now }
});

attemptSchema.virtual('accuracy').get(function() {
  if (this.total_questions === 0) return 0.0;
  return Number(((this.score / this.total_questions) * 100).toFixed(1));
});

attemptSchema.set('toObject', { virtuals: true });
attemptSchema.set('toJSON', { virtuals: true });

attemptSchema.methods.toDict = function() {
  return {
    id: this._id,
    user_id: this.user_id,
    quiz_id: this.quiz_id,
    score: this.score,
    total_questions: this.total_questions,
    accuracy: this.accuracy,
    attempted_at: this.attempted_at
  };
};

module.exports = mongoose.model('Attempt', attemptSchema);
