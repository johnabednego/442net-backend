const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authConfig = require('../config/auth');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, authConfig.jwtSecret);

      const user = await User.findById(decoded.id);

      // Check if token version matches the current version on user record
      if (user.tokenVersion !== decoded.tokenVersion) {
        res.status(401).json({ message: 'Token has expired.' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({ message: 'Token has expired.' });
      } else if (error.name === "JsonWebTokenError") {
        res.status(401).json({ message: 'Invalid token.' });
      } else {
        res.status(401).json({ message: 'Not authorized to access this resource.' });
      }
    }
  } else {
    res.status(401).json({ message: 'Not authorized to access this resource.' });
  }
};
