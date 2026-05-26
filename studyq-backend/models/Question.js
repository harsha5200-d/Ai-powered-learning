const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  question_text: { type: String, required: true },
  option_a: { type: String, required: true },
  option_b: { type: String, required: true },
  option_c: { type: String, required: true },
  option_d: { type: String, required: true },
  correct_answer: { type: String, required: true }, // 'A', 'B', 'C', or 'D'
});

questionSchema.methods.toDict = function(hide_answer = true) {
  const data = {
    id: this._id,
    quiz_id: this.quiz_id,
    question_text: this.question_text,
    option_a: this.option_a,
    option_b: this.option_b,
    option_c: this.option_c,
    option_d: this.option_d,
  };
  if (!hide_answer) {
    data.correct_answer = this.correct_answer;
  }
  return data;
};

module.exports = mongoose.model('Question', questionSchema);
