const Scheme = require('../models/Scheme');
const SchemeMember = require('../models/SchemeMember');
const Installment = require('../models/Installment');
const User = require('../models/User');

exports.getSchemeMembers = async (req, res) => {
  try {
    const members = await SchemeMember.find({ scheme: req.params.schemeId })
      .populate('user', 'name mobile aadhaarNo')
      .sort({ assignedDate: -1 });
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.addMemberToScheme = async (req, res) => {
  try {
    const { userId } = req.body;
    const schemeId = req.params.schemeId;

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    if (scheme.status !== 'draft' && scheme.status !== 'active') {
      return res.status(400).json({ message: 'Scheme not open for enrollment' });
    }

    const currentCount = await SchemeMember.countDocuments({ scheme: schemeId });
    if (currentCount >= scheme.maxMembers) {
      return res.status(400).json({ message: 'Scheme is full' });
    }

    const user = await User.findOne({ _id: userId, role: 'member' });
    if (!user) return res.status(404).json({ message: 'User not found or not a member' });

    const existing = await SchemeMember.findOne({ user: userId, scheme: schemeId });
    if (existing) return res.status(400).json({ message: 'User already added to this scheme' });

    const schemeMember = new SchemeMember({
      user: userId,
      scheme: schemeId,
      assignedDate: new Date()
    });

    await schemeMember.save();

    if (scheme.status === 'active') {
      await generateInstallmentsForMember(schemeMember, scheme);
    }

    res.json(schemeMember);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.removeMemberFromScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.schemeId);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    if (scheme.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot remove members after scheme is active' });
    }

    const member = await SchemeMember.findOneAndDelete({ _id: req.params.memberId, scheme: req.params.schemeId });
    if (!member) return res.status(404).json({ message: 'Member not found in scheme' });

    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

async function generateInstallmentsForMember(schemeMember, scheme) {
  const installments = [];
  for (let month = 1; month <= scheme.durationMonths; month++) {
    const dueDate = new Date(scheme.startDate);
    dueDate.setMonth(dueDate.getMonth() + (month - 1));
    installments.push({
      schememember: schemeMember._id,
      monthNumber: month,
      dueDate: dueDate,
      amountDue: scheme.monthlyAmount,
      status: 'pending'
    });
  }
  await Installment.insertMany(installments);
}

exports.generateInstallmentsForMember = generateInstallmentsForMember;

exports.allotPrize = async (req, res) => {
  try {
    const schemeId = req.params.schemeId;
    const { userId, monthNumber } = req.body;

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    if (scheme.status !== 'active') return res.status(400).json({ message: 'Scheme is not active' });

    let targetMonth = monthNumber;
    if (!targetMonth) {
      const allotedMonths = await SchemeMember.find({ scheme: schemeId, prizedMonth: { $ne: null } }).distinct('prizedMonth');
      for (let i = 1; i <= scheme.durationMonths; i++) {
        if (!allotedMonths.includes(i)) {
          targetMonth = i;
          break;
        }
      }
      if (!targetMonth) return res.status(400).json({ message: 'All months have been alloted' });
    } else {
      const alreadyAlloted = await SchemeMember.findOne({ scheme: schemeId, prizedMonth: targetMonth });
      if (alreadyAlloted) return res.status(400).json({ message: `Month ${targetMonth} already alloted` });
    }

    const prizeEntry = scheme.prizeSchedule.find(p => p.monthNumber === targetMonth);
    if (!prizeEntry) return res.status(400).json({ message: 'Invalid month number' });

    const schememember = await SchemeMember.findOne({ user: userId, scheme: schemeId });
    if (!schememember) return res.status(404).json({ message: 'Member not found in scheme' });
    if (schememember.prizedMonth) return res.status(400).json({ message: 'Member already received prize' });

    schememember.prizedMonth = targetMonth;
    schememember.prizedAmount = prizeEntry.prizeAmount;
    schememember.prizeDate = new Date();
    await schememember.save();

    const PrizePayout = require('../models/PrizePayout');
    await PrizePayout.create({
      schememember: schememember._id,
      scheme: schemeId,
      monthNumber: targetMonth,
      prizeAmount: prizeEntry.prizeAmount,
      recordedBy: req.user.id
    });

    res.json(schememember);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};