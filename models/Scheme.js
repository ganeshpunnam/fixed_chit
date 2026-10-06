const mongoose = require('mongoose');

const PrizeScheduleSchema = new mongoose.Schema({
  monthNumber: { type: Number, required: true },
  prizeAmount: { type: Number, required: true }
}, { _id: false });

const SchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  durationMonths: { type: Number, required: true },
  monthlyAmount: { type: Number, required: true },
  lateFeePerMonth: { type: Number, default: 0 },
  maxMembers: { type: Number, required: true },
  startDate: { type: Date },
  prizeSchedule: [PrizeScheduleSchema],
  status: { type: String, enum: ['draft','active','completed'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Ensure prize schedule length matches durationMonths when active
SchemeSchema.pre('save', function(next) {
  if (this.status === 'active' && this.prizeSchedule.length !== this.durationMonths) {
    return next(new Error('Prize schedule must have exactly ' + this.durationMonths + ' entries'));
  }
  next();
});

module.exports = mongoose.model('Scheme', SchemeSchema);