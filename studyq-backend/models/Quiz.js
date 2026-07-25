const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  document_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  created_at: { type: Date, default: Date.now }
});

quizSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quiz_id'
});

quizSchema.virtual('attempts', {
  ref: 'Attempt',
  localField: '_id',
  foreignField: 'quiz_id'
});

quizSchema.set('toObject', { virtuals: true });
quizSchema.set('toJSON', { virtuals: true });

quizSchema.methods.toDict = async function(include_questions = false, hide_answers = true) {
  if (!this.populated('questions')) await this.populate('questions');
  if (!this.populated('attempts')) await this.populate('attempts');
  
  const data = {
    id: this._id,
    user_id: this.user_id,
    document_id: this.document_id,
    created_at: this.created_at,
    question_count: this.questions ? this.questions.length : 0,
    attempt_count: this.attempts ? this.attempts.length : 0
  };

  if (include_questions && this.questions) {
    data.questions = this.questions.map(q => q.toDict(hide_answers));
  }

  return data;
};

module.exports = mongoose.model('Quiz', quizSchema);
