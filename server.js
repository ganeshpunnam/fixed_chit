
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// ===============================
// Connect to MongoDB
// ===============================
connectDB();

// ===============================
// CORS Configuration
// ===============================
const allowedOrigins = [
  'http://localhost:5173',
  'https://fixedchitfrontend.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ],

    credentials: true
  })
);

// ===============================
// Body Parser
// ===============================
app.use(express.json());

// ===============================
// Import Routes
// ===============================
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const schemeRoutes = require('./routes/schemes');
const schemeMemberRoutes = require('./routes/schememembers');
const installmentRoutes = require('./routes/installments');
const reportRoutes = require('./routes/reports');
const memberRoutes = require('./routes/member');

// ===============================
// API Routes
// ===============================

// Original API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/schememembers', schemeMemberRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/member', memberRoutes);

// ===============================
// Frontend Compatibility Routes
// ===============================
// These allow your existing frontend
// to work WITHOUT changing frontend URLs.

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/schemes', schemeRoutes);
app.use('/schememembers', schemeMemberRoutes);
app.use('/installments', installmentRoutes);
app.use('/reports', reportRoutes);
app.use('/member', memberRoutes);

// ===============================
// Health / Basic Route
// ===============================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Chit Fund API is running',
    status: 'OK'
  });
});

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ===============================
// Global Error Handler
// ===============================
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS: Origin not allowed'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

