const mongoose = require('mongoose');

const SecurityChequeSchema = new mongoose.Schema({
  schememember: { type: mongoose.Schema.Types.ObjectId, ref: 'SchemeMember', required: true },
  chequeImageUrl: String,
  chequeNumber: String,
  bankName: String,
  witnessName: String,
  witnessContact: String,
  submittedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['held','used','returned'], default: 'held' }
}, { timestamps: true });

module.exports = mongoose.model('SecurityCheque', SecurityChequeSchema);