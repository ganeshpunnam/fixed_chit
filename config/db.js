const mongoose = require('mongoose');
const keys = require('./keys');

const connectDB = async () => {
  try {
    await mongoose.connect(keys.mongoURI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;