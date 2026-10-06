const Scheme = require('../models/Scheme');

// @desc    Create scheme
exports.createScheme = async (req, res) => {
  try {
    const { name, durationMonths, monthlyAmount, lateFeePerMonth, maxMembers, startDate, prizeSchedule } = req.body;
    
    // Validate prize schedule length (we'll check again on activation)
    if (prizeSchedule.length !== durationMonths) {
      return res.status(400).json({ message: `Prize schedule must have exactly ${durationMonths} entries` });
    }

    const scheme = new Scheme({
      name,
      durationMonths,
      monthlyAmount,
      lateFeePerMonth,
      maxMembers,
      startDate,
      prizeSchedule,
      createdBy: req.user.id
    });

    await scheme.save();
    res.json(scheme);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Get all schemes
exports.getSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.json(schemes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Get single scheme
exports.getScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    res.json(scheme);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Update scheme (only if draft)
exports.updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    if (scheme.status !== 'draft') {
      return res.status(400).json({ message: 'Can only edit draft schemes' });
    }

    const updates = req.body;
    // Prevent changing status directly; use activate endpoint
    delete updates.status;
    
    Object.assign(scheme, updates);
    await scheme.save();
    res.json(scheme);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Activate scheme (status draft -> active)
exports.activateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    if (scheme.status !== 'draft') {
      return res.status(400).json({ message: 'Scheme is not in draft status' });
    }
    
    // Validate prize schedule again
    if (scheme.prizeSchedule.length !== scheme.durationMonths) {
      return res.status(400).json({ message: 'Prize schedule incomplete' });
    }

    scheme.status = 'active';
    await scheme.save();

    // Here you would also generate installments for all members in the scheme automatically.
    // We'll do that in the activate route by calling a function, but for separation we'll keep it in route file.
    // But we can also just export an activate service.
    // We will do it in the route after calling this controller.
    
    res.json(scheme);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
