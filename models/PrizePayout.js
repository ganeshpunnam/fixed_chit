const mongoose = require('mongoose');

const PrizePayoutSchema = new mongoose.Schema({
  schememember: { type: mongoose.Schema.Types.ObjectId, ref: 'SchemeMember', required: true },
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
  monthNumber: { type: Number, required: true },
  prizeAmount: { type: Number, required: true },
  payoutDate: { type: Date, default: Date.now },
  payoutMethod: { type: String, enum: ['bank_transfer','cheque','cash'], default: 'bank_transfer' },
  transactionRef: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PrizePayout', PrizePayoutSchema);
