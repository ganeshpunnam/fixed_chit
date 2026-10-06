const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

// Protect routes
module.exports = (roles = []) => {
  // roles param can be a single role string (e.g., 'admin') or an array of roles
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, keys.jwtSecret);
      req.user = decoded.user; // contains { id, role }
      
      // Role check if roles are specified
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access forbidden: insufficient role' });
      }
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};





