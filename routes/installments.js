const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getInstallmentsByScheme, getMemberInstallments, payInstallment } = require('../controllers/installmentController');

// These routes are for admin (or member can view own via member routes)
router.use(auth(['admin']));

// Get installments of a scheme (optional ?month=)
router.get('/scheme/:schemeId', getInstallmentsByScheme);

// Get installments for a specific member-scheme relationship
router.get('/member/:schemeMemberId', getMemberInstallments);

// Record payment
router.post('/pay', payInstallment);

module.exports = router;