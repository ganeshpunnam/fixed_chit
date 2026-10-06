const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: String,
  password: { type: String, required: true },
  aadhaarNo: String,
  panNo: String,
  photoUrl: String,
  bankAccount: String,
  bankIfsc: String,
  kycStatus: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  role: { type: String, enum: ['member','admin'], default: 'member' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);