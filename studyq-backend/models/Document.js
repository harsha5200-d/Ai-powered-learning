const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  file_name: { type: String, required: true },
  extracted_text: { type: String, required: true },
  notes: { type: String, default: null },
  uploaded_at: { type: Date, default: Date.now },
});

// To count quizzes
documentSchema.virtual('quizzes', {
  ref: 'Quiz',
  localField: '_id',
  foreignField: 'document_id'
});

documentSchema.set('toObject', { virtuals: true });
documentSchema.set('toJSON', { virtuals: true });

documentSchema.methods.toDict = function(include_text = false, quiz_count = 0) {
  const data = {
    id: this._id,
    user_id: this.user_id,
    file_name: this.file_name,
    uploaded_at: this.uploaded_at,
    notes: this.notes,
    quiz_count: quiz_count
  };
  if (include_text) {
    data.extracted_text = this.extracted_text;
  }
  return data;
};

module.exports = mongoose.model('Document', documentSchema);
