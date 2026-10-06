const mongoose = require('mongoose');

const SchemeMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
  assignedDate: { type: Date, default: Date.now },
  prizedMonth: { type: Number },             // month number (1..duration)
  prizedAmount: Number,
  prizeDate: Date,
  payoutStatus: { type: String, enum: ['pending','paid'], default: 'pending' },
  securityChequeSubmitted: { type: Boolean, default: false },
  witnessName: String,
  witnessContact: String,
  status: { type: String, enum: ['active','completed','defaulted'], default: 'active' }
}, { timestamps: true });

// Compound index to prevent duplicate membership
SchemeMemberSchema.index({ user: 1, scheme: 1 }, { unique: true });

module.exports = mongoose.model('SchemeMember', SchemeMemberSchema);
