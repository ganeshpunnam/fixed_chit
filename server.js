const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// CORS CONFIGURATION
// =====================================================

const FRONTEND_URL = 'https://fixedchitfrontend.vercel.app';

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  optionsSuccessStatus: 204
};

// CORS middleware
app.use(cors(corsOptions));

// =====================================================
// EXPLICIT PREFLIGHT HANDLER
// =====================================================

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// REQUEST LOGGING
// =====================================================

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// =====================================================
// IMPORT ROUTES
// =====================================================

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const schemeRoutes = require('./routes/schemes');
const schemeMemberRoutes = require('./routes/schememembers');
const installmentRoutes = require('./routes/installments');
const reportRoutes = require('./routes/reports');
const memberRoutes = require('./routes/member');

// =====================================================
// API ROUTES
// =====================================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/schememembers', schemeMemberRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/member', memberRoutes);

// =====================================================
// FRONTEND COMPATIBILITY ROUTES
//
// Existing frontend URLs:
//
// /auth/member/login
// /auth/admin/login
// /users
// /schemes
// /schememembers
// /installments
// /reports
// /member
// =====================================================

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/schemes', schemeRoutes);
app.use('/schememembers', schemeMemberRoutes);
app.use('/installments', installmentRoutes);
app.use('/reports', reportRoutes);
app.use('/member', memberRoutes);

// =====================================================
// ROOT HEALTH CHECK
// =====================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Chit Fund API is running'
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy'
  });
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  // Always send CORS headers on errors
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Credentials', 'true');

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
