const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'activamente-secret-change-in-production';
const SALT_ROUNDS = 10;

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Middleware to extract user from request
function getUserFromRequest(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

// Require auth middleware for Vercel functions
function requireAuth(handler) {
  return async (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'No autorizado. Inicia sesión primero.' });
    }
    req.user = user;
    return handler(req, res);
  };
}

// Require specific role
function requireRole(...roles) {
  return (handler) => {
    return async (req, res) => {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'No autorizado.' });
      }
      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de ' + roles.join(' o ') });
      }
      req.user = user;
      return handler(req, res);
    };
  };
}

// Helper to set CORS headers
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Handle OPTIONS preflight
function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCors(res);
    res.status(200).end();
    return true;
  }
  return false;
}

// Parse JSON body helper (handles Vercel pre-parsed body + raw stream)
async function parseBody(req) {
  // Vercel may have already parsed the body
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return req.body;
  }
  // Fallback: read from stream
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON: ' + body.substring(0, 100)));
      }
    });
  });
}

module.exports = {
  signToken, verifyToken, hashPassword, comparePassword,
  getUserFromRequest, requireAuth, requireRole,
  setCors, handleOptions, parseBody
};
