// Admin Authentication Middleware
const { checkSession } = require('../services/adminAuth');

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '') || 
                req.headers['x-admin-token'] || 
                req.query.token ||
                req.body.token;
  
  const result = checkSession(token);
  
  if (result.success && result.isAdmin) {
    req.admin = true;
    req.adminToken = token;
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Admin access required. Please login.',
      isAdmin: false
    });
  }
}

// Optional: Check if admin (but don't block if not)
function optionalAdmin(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '') || 
                req.headers['x-admin-token'] || 
                req.query.token ||
                req.body.token;
  
  const result = checkSession(token);
  
  if (result.success && result.isAdmin) {
    req.admin = true;
    req.adminToken = token;
  } else {
    req.admin = false;
  }
  
  next();
}

module.exports = {
  requireAdmin,
  optionalAdmin
};

