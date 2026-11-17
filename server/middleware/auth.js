const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Validates JWT token from the Authorization header and attaches the user document to req.user.
 * Also supports development fallback via headers (x-user-id or mock token) if enabled.
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Support dev fallback header for quick API testing if explicitly allowed or in dev mode
    if (!token && (process.env.NODE_ENV === 'development' || !process.env.JWT_SECRET)) {
      const devUserId = req.headers['x-user-id'];
      if (devUserId) {
        const user = await User.findById(devUserId);
        if (user) {
          req.user = user;
          return next();
        }
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed: No bearer token provided.',
      });
    }

    const secret = process.env.JWT_SECRET || 'fallback_development_secret_key_12345';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed: Invalid or expired token.',
      });
    }

    // Find the user by ID from the decoded payload
    const user = await User.findById(decoded.id || decoded._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed: User no longer exists.',
      });
    }

    // Attach authenticated user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication.',
    });
  }
};

module.exports = authenticate;
