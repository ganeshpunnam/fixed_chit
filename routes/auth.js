const express = require('express');
const router = express.Router();
const { adminLogin, memberLogin } = require('../controllers/authController');

// @route   POST api/auth/admin/login
router.post('/admin/login', adminLogin);

// @route   POST api/auth/member/login
router.post('/member/login', memberLogin);

module.exports = router;