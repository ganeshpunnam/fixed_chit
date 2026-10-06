const mongoose = require('mongoose');

const InstallmentSchema = new mongoose.Schema({
  schememember: { type: mongoose.Schema.Types.ObjectId, ref: 'SchemeMember', required: true },
  monthNumber: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  amountDue: { type: Number, required: true },
  paidAmount: Number,
  paidDate: Date,
  lateFeeAdded: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ['cash','bank_transfer','online','cheque'], default: 'cash' },
  status: { type: String, enum: ['pending','paid','overdue'], default: 'pending' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiptUrl: String
}, { timestamps: true });

// Compound index to ensure one installment per member per month
InstallmentSchema.index({ schememember: 1, monthNumber: 1 }, { unique: true });

module.exports = mongoose.model('Installment', InstallmentSchema);
