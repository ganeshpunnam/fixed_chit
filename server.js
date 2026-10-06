
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// ==========================================
// MongoDB
// ==========================================
connectDB();

// ==========================================
// CORS
// ==========================================

// Allow requests from your Vercel frontend
// and localhost during development.
//
// origin: true reflects the requesting origin,
// which also makes the OPTIONS preflight work.
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization'
    ],
    optionsSuccessStatus: 204
  })
);

// Explicitly handle OPTIONS preflight requests
app.options('*', cors());

// ==========================================
// Body Parser
// ==========================================
app.use(express.json());

// ==========================================
// Import Routes
// ==========================================
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const schemeRoutes = require('./routes/schemes');
const schemeMemberRoutes = require('./routes/schememembers');
const installmentRoutes = require('./routes/installments');
const reportRoutes = require('./routes/reports');
const memberRoutes = require('./routes/member');

// ==========================================
// API Routes
// ==========================================

// Original API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/schememembers', schemeMemberRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/member', memberRoutes);

// ==========================================
// Frontend Compatibility Routes
// ==========================================
// Your existing frontend uses these URLs.
// Therefore, we keep them working without
// changing the frontend.

// Authentication
app.use('/auth', authRoutes);

// Users
app.use('/users', userRoutes);

// Schemes
app.use('/schemes', schemeRoutes);

// Scheme Members
app.use('/schememembers', schemeMemberRoutes);

// Installments
app.use('/installments', installmentRoutes);

// Reports
app.use('/reports', reportRoutes);

// Members
app.use('/member', memberRoutes);

// ==========================================
// Health Check
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Chit Fund API is running',
    status: 'OK'
  });
});

// ==========================================
// 404 Handler
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ==========================================
// Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS origin not allowed'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ==========================================
// Start Server
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

