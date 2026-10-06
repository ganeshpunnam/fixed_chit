const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSchemeMembers, addMemberToScheme, removeMemberFromScheme, allotPrize } = require('../controllers/schemeMemberController');

router.use(auth(['admin']));

// @route   GET api/schememembers/:schemeId/members
router.get('/:schemeId/members', getSchemeMembers);

// @route   POST api/schememembers/:schemeId/members
router.post('/:schemeId/members', addMemberToScheme);

// @route   DELETE api/schememembers/:schemeId/members/:memberId
router.delete('/:schemeId/members/:memberId', removeMemberFromScheme);

// @route   POST api/schememembers/:schemeId/prize-allot
router.post('/:schemeId/prize-allot', allotPrize);

module.exports = router;
