const User = require('../models/User');
const SchemeMember = require('../models/SchemeMember');
const Installment = require('../models/Installment');
const PrizePayout = require('../models/PrizePayout');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getMySchemes = async (req, res) => {
  try {
    const memberships = await SchemeMember.find({ user: req.user.id })
      .populate('scheme', 'name durationMonths monthlyAmount startDate status prizeSchedule');
    res.json(memberships);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getMyInstallments = async (req, res) => {
  try {
    const membership = await SchemeMember.findOne({ _id: req.params.schemeMemberId, user: req.user.id });
    if (!membership) return res.status(403).json({ message: 'Access denied' });

    const installments = await Installment.find({ schememember: req.params.schemeMemberId }).sort({ monthNumber: 1 });
    res.json(installments);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getMyPrizes = async (req, res) => {
  try {
    const membership = await SchemeMember.findOne({ user: req.user.id, prizedMonth: { $ne: null } });
    if (!membership) return res.json({ message: 'No prize won yet' });

    const payout = await PrizePayout.findOne({ schememember: membership._id });
    res.json({ membership, payout });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};