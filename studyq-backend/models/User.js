const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

userSchema.methods.setPassword = async function(password) {
  this.password_hash = await bcrypt.hash(password, 10);
};

userSchema.methods.checkPassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

userSchema.methods.toDict = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    created_at: this.created_at
  };
};

module.exports = mongoose.model('User', userSchema);
