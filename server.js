const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const schemeRoutes = require('./routes/schemes');
const schemeMemberRoutes = require('./routes/schememembers');
const installmentRoutes = require('./routes/installments');
const reportRoutes = require('./routes/reports');
const memberRoutes = require('./routes/member');
console.log('MONGO_URI:', process.env.MONGO_URI);
// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/schememembers', schemeMemberRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/member', memberRoutes);

// Basic route
app.get('/', (req, res) => res.json({ message: 'Chit Fund API' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));