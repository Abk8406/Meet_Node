const jwt = require('jsonwebtoken');

// Generate Refresh Token
function generateRefreshToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '10m' });  // Refresh token expires in 7 days
}

// Verify Refresh Token
function verifyRefreshToken(refreshToken) {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        return decoded.userId;  // Return the userId to fetch user details
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
}

module.exports = { generateRefreshToken, verifyRefreshToken };
