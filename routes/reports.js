const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { collectionReport, prizePayoutReport, defaulterList, memberStatement } = require('../controllers/reportController');

router.use(auth(['admin']));

router.get('/collection', collectionReport);
router.get('/prize-payouts', prizePayoutReport);
router.get('/defaulters', defaulterList);
router.get('/member-statement/:schemeMemberId', memberStatement);

module.exports = router;