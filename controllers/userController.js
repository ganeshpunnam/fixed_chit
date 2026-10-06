const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'member' }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'User not found' });
    res.status(500).send('Server error');
  }
};

// @desc    Create a new member (admin only)
exports.createUser = async (req, res) => {
  const { name, mobile, email, password, aadhaarNo, panNo, bankAccount, bankIfsc } = req.body;
  try {
    // Check if mobile already exists
    let user = await User.findOne({ mobile });
    if (user) return res.status(400).json({ message: 'Mobile number already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      mobile,
      email,
      password: hashedPassword,
      aadhaarNo,
      panNo,
      bankAccount,
      bankIfsc,
      createdBy: req.user.id
    });

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Update user (admin only)
exports.updateUser = async (req, res) => {
  const updates = req.body;
  delete updates.password; // don't update password here without hashing
  delete updates.role; // admin can't change role

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};