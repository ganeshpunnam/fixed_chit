const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createScheme, getSchemes, getScheme, updateScheme, activateScheme } = require('../controllers/schemeController');
const SchemeMember = require('../models/SchemeMember');
const Installment = require('../models/Installment');
const { generateInstallmentsForMember } = require('../controllers/schemeMemberController');

router.use(auth(['admin']));

router.post('/', createScheme);
router.get('/', getSchemes);
router.get('/:id', getScheme);
router.put('/:id', updateScheme);

// Activate scheme
router.put('/:id/activate', async (req, res) => {
  try {
    const scheme = await require('../models/Scheme').findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    if (scheme.status !== 'draft') return res.status(400).json({ message: 'Scheme not in draft' });

    scheme.status = 'active';
    await scheme.save();

    // Generate installments for all existing members
    const members = await SchemeMember.find({ scheme: req.params.id });
    for (const member of members) {
      await generateInstallmentsForMember(member, scheme);
    }

    res.json(scheme);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
