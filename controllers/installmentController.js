const Installment = require('../models/Installment');
const SchemeMember = require('../models/SchemeMember');
const Scheme = require('../models/Scheme');

// @desc    Get installments for a scheme, optionally filtered by month
exports.getInstallmentsByScheme = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { schememember: { $in: await SchemeMember.find({ scheme: req.params.schemeId }).distinct('_id') } };
    if (month) filter.monthNumber = parseInt(month);
    
    const installments = await Installment.find(filter)
      .populate({
        path: 'schememember',
        select: 'user prizedMonth',
        populate: { path: 'user', select: 'name mobile' }
      })
      .sort({ monthNumber: 1 });
    res.json(installments);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Get installment history for a single scheme member
exports.getMemberInstallments = async (req, res) => {
  try {
    const installments = await Installment.find({ schememember: req.params.schemeMemberId })
      .sort({ monthNumber: 1 });
    res.json(installments);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Record payment for an installment
exports.payInstallment = async (req, res) => {
  try {
    const { schemememberId, monthNumber, amount, paymentMode } = req.body;
    if (!schemememberId || !monthNumber) {
      return res.status(400).json({ message: 'schemememberId and monthNumber required' });
    }

    const installment = await Installment.findOne({ schememember: schemememberId, monthNumber });
    if (!installment) return res.status(404).json({ message: 'Installment not found' });
    if (installment.status === 'paid') return res.status(400).json({ message: 'Installment already paid' });

    // Get scheme's late fee rule
    const schememember = await SchemeMember.findById(schemememberId).populate('scheme');
    if (!schememember) return res.status(404).json({ message: 'Scheme member not found' });
    
    const scheme = schememember.scheme;
    const now = new Date();
    let lateFee = 0;
    if (new Date(now) > new Date(installment.dueDate)) {
      // Calculate overdue months (simple: if overdue at all, apply one late fee; adjust for multiple months if needed) 
      // For simplicity: single late fee per month if overdue; you can enhance later
      lateFee = scheme.lateFeePerMonth;
    }

    installment.paidAmount = amount || installment.amountDue + lateFee;
    installment.paidDate = new Date();
    installment.lateFeeAdded = lateFee;
    installment.paymentMode = paymentMode || 'cash';
    installment.status = 'paid';
    installment.recordedBy = req.user.id;

    await installment.save();
    res.json(installment);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
