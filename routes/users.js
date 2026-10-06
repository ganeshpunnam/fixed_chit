const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllUsers, getUser, createUser, updateUser } = require('../controllers/userController');

// All routes require admin authentication
router.use(auth(['admin']));

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);

module.exports = router;
