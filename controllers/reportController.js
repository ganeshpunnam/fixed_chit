const Installment = require('../models/Installment');
const PrizePayout = require('../models/PrizePayout');
const SchemeMember = require('../models/SchemeMember');
const Scheme = require('../models/Scheme');

exports.collectionReport = async (req, res) => {
  try {
    const filter = {};
    if (req.query.schemeId) {
      const members = await SchemeMember.find({ scheme: req.query.schemeId }).select('_id');
      filter.schememember = { $in: members.map(m => m._id) };
    }
    if (req.query.from) filter.paidDate = { $gte: new Date(req.query.from) };
    if (req.query.to) filter.paidDate = { ...filter.paidDate, $lte: new Date(req.query.to) };
    
    const collections = await Installment.find({ status: 'paid', ...filter })
      .populate({
        path: 'schememember',
        select: 'user scheme prizedMonth',
        populate: { path: 'user', select: 'name mobile' }
      });
    res.json(collections);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.prizePayoutReport = async (req, res) => {
  try {
    const filter = {};
    if (req.query.schemeId) filter.scheme = req.query.schemeId;
    const payouts = await PrizePayout.find(filter)
      .populate({
        path: 'schememember',
        select: 'user',
        populate: { path: 'user', select: 'name mobile' }
      });
    res.json(payouts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.defaulterList = async (req, res) => {
  try {
    const { schemeId } = req.query;
    const filter = { status: 'pending' };
    if (schemeId) {
      const members = await SchemeMember.find({ scheme: schemeId }).select('_id');
      filter.schememember = { $in: members.map(m => m._id) };
    }
    // Overdue installments: status pending and due date < now
    filter.dueDate = { $lt: new Date() };
    const defaults = await Installment.find(filter)
      .populate({
        path: 'schememember',
        select: 'user scheme',
        populate: { path: 'user', select: 'name mobile' }
      });
    res.json(defaults);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.memberStatement = async (req, res) => {
  try {
    const schememember = await SchemeMember.findById(req.params.schemeMemberId)
      .populate('user', 'name mobile')
      .populate('scheme', 'name');
    if (!schememember) return res.status(404).json({ message: 'Member not found' });
    
    const installments = await Installment.find({ schememember: req.params.schemeMemberId }).sort({ monthNumber: 1 });
    const prizePayout = await PrizePayout.findOne({ schememember: req.params.schemeMemberId });
    
    res.json({ member: schememember, installments, prizePayout });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
