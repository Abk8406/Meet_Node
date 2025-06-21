const jwt = require('jsonwebtoken');

// Middleware to verify the token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from 'Authorization' header
  
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  // Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // If the token is valid, attach the decoded user info to the request object
    req.user = decoded;
    next(); // Continue to the next route handler
  });
};

module.exports = verifyToken;
