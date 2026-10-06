const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, getMySchemes, getMyInstallments, getMyPrizes } = require('../controllers/memberController');

// Member view-only routes
router.use(auth(['member']));

router.get('/profile', getProfile);
router.get('/schemes', getMySchemes);
router.get('/schemes/:schemeMemberId/installments', getMyInstallments);
router.get('/prizes', getMyPrizes);

module.exports = router;