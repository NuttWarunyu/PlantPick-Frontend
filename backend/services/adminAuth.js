// Simple Admin Authentication Service
// ใช้ password จาก environment variable

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Default password (ควรเปลี่ยนใน production)

// Simple in-memory session store (สำหรับ production ควรใช้ Redis หรือ database)
const sessions = new Map();

// Generate session token
function generateToken() {
  return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Login
function login(password) {
  if (password === ADMIN_PASSWORD) {
    const token = generateToken();
    const session = {
      token,
      isAdmin: true,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
    sessions.set(token, session);
    return { success: true, token, session };
  }
  return { success: false, message: 'Invalid password' };
}

// Check session
function checkSession(token) {
  if (!token) return { success: false, isAdmin: false };
  
  const session = sessions.get(token);
  if (!session) return { success: false, isAdmin: false };
  
  // Check if expired
  if (new Date() > new Date(session.expiresAt)) {
    sessions.delete(token);
    return { success: false, isAdmin: false, message: 'Session expired' };
  }
  
  return { success: true, isAdmin: true, session };
}

// Logout
function logout(token) {
  if (token && sessions.has(token)) {
    sessions.delete(token);
    return { success: true };
  }
  return { success: false };
}

// Clean expired sessions (run periodically)
function cleanExpiredSessions() {
  const now = new Date();
  for (const [token, session] of sessions.entries()) {
    if (now > new Date(session.expiresAt)) {
      sessions.delete(token);
    }
  }
}

// Clean expired sessions every hour
setInterval(cleanExpiredSessions, 60 * 60 * 1000);

module.exports = {
  login,
  checkSession,
  logout,
  ADMIN_PASSWORD
};

