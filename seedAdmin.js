const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    const existing = await User.findOne({ role: 'admin' });

    if (existing) {
      console.log('Admin already exists');
      await mongoose.disconnect();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'Admin1',
      mobile: '9000212358',
      email: 'admin@chitfund1.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin created successfully');
    console.log('Mobile: 9000212358');
    console.log('Password: admin123');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed admin failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();