const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// =====================================================
// CONNECT TO MONGODB
// =====================================================
connectDB();

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  'https://fixedchitfrontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without Origin
      // Example: Postman, curl, server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('Blocked CORS origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

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

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// Your existing Vercel frontend uses:
// /auth/member/login
// /auth/admin/login
// /schemes
// /users
// etc.
//
// So we keep these URLs working.
// =====================================================

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/schemes', schemeRoutes);
app.use('/schememembers', schemeMemberRoutes);
app.use('/installments', installmentRoutes);
app.use('/reports', reportRoutes);
app.use('/member', memberRoutes);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Chit Fund API is running',
    environment: process.env.NODE_ENV || 'production'
  });
});

// =====================================================
// API HEALTH CHECK
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
  console.error('Server Error:', err.message);

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS origin not allowed'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

