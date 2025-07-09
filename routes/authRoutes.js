const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // MySQL connection
const User = require("../Model/User");
const Role = require("../Model/Role");
const verifyToken = require("../middleware/authMiddleware");
const { generateRefreshToken, verifyRefreshToken } = require('../Utility/jsonwebtoken');
require('dotenv').config();
const nodemailer = require("nodemailer");
const router = express.Router();
// const { storeOTP, getOTP, deleteOTP } = require("../redis/redis");

// In-memory OTP store (email -> { otp, expiresAt })
const otpStore = {};
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function storeOTP(email, otp) {
    otpStore[email] = { otp: otp.toString(), expiresAt: Date.now() + OTP_EXPIRY_MS };
}

function getOTP(email) {
    const entry = otpStore[email];
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        delete otpStore[email];
        return null;
    }
    return entry.otp;
}

function deleteOTP(email) {
    delete otpStore[email];
}

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }

    try {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, as: "role", attributes: ["id", "role_name"] }],
            raw: false,
            nest: true
          });
      
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate access and refresh token
        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role_id: user.role_id,
                role_name: user.role ? user.role.role_name : null,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1m" }
        );

        const refreshToken = generateRefreshToken(user.id);  // Custom function to create refresh token

        // Store refreshToken in the database or memory (Not shown here, ensure it's stored securely)

        res.json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                created_at: user.created_at,
                role_id: user.role_id,
                role_name: user.role ? user.role.role_name : null,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


router.post("/refresh-token", async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
    }

    try {
        // Verify the refresh token
        const userId = verifyRefreshToken(refreshToken);  // Custom function to verify refresh token

        // Get user details based on userId (you can use any way to get the user, like Sequelize findByPk)
        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: "role", attributes: ["id", "role_name"] }],
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid refresh token" });
        }

        // Generate a new access token
        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role_id: user.role.id,
                role_name: user.role.role_name,
            },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        res.json({
            message: "Access token refreshed successfully",
            accessToken,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get('/getAllRoles', verifyToken, async (req, res) => {
    try {
        // Fetch all roles from the database
        const roles = await Role.findAll();

        // If no roles are found
        if (roles.length === 0) {
            return res.status(404).json({ message: "No roles found" });
        }

        // Send the roles as a response
        res.status(200).json(roles);
    } catch (error) {
        // Handle any errors that occur during the query
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
})
router.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required!" });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Store OTP in Redis
        await storeOTP(email, otp);

        console.log("🔢 Generated OTP:", otp);
        console.log(`🔐 Stored OTP for ${email}`);

        // Send OTP via Email
        await sendOTPEmail(email, otp);

        res.status(200).json({ message: "OTP sent successfully!" });

    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        res.status(500).json({ message: "Failed to send OTP" });
    }
});

// Function to send OTP email
async function sendOTPEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "abbk8406@gmail.com",
                pass: "ohyosrkwnltmlhyw",
            },
        });

        const mailOptions = {
            from: "abbk8406@gmail.com",
            to: email,
            subject: "🔐 Your OTP Code",
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #4CAF50;">Your OTP Code</h2>
                    <p style="font-size: 18px;">Use this OTP to verify your email:</p>
                    <h1 style="color: #333;">${otp}</h1>
                    <p style="font-size: 14px; color: #666;">This OTP is valid for 10 minutes.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ OTP email sent successfully to", email);
    } catch (error) {
        console.error("❌ Error sending OTP email:", error);
    }
}

router.post("/verify-otp", async  (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required!" });
    }
    const storedOtp = await getOTP(email);
    if (!storedOtp || storedOtp !== otp) {
        return res.status(400).json({ message: "Invalid or expired OTP!" });
    }
    res.status(200).json({ message: "OTP verified successfully!" });
});

router.post("/register", async (req, res) => {
    try {
        console.log("➡️ Register API hit");

        const { name, email, password, role_name, otp } = req.body;
        console.log("📥 Request Body:", req.body);

        // Validate required fields
        if (!name || !email || !password || !role_name || !otp) {
            return res.status(400).json({ message: "All fields including OTP are required!" });
        }
        console.log("🔍 Validating OTP...",storeOTP);
        const storedOtp = await getOTP(email);

        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP!" });
        }
    
        await deleteOTP(email); // Remove OTP after successful verification
        console.log("👍 OTP verified successfully");

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already registered!" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Find the role by name
        const role = await Role.findOne({ where: { role_name } });
        if (!role) {
            return res.status(400).json({ message: "Role not found!" });
        }
        const role_id = role.id;

        // Create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role_id,
            role_name,
        });

        console.log("✅ User registered successfully:", newUser);
        await sendNotificationEmail(name, email);

        res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



async function sendNotificationEmail(name, email) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "abbk8406@gmail.com",
                pass: "ohyosrkwnltmlhyw",
            },
            debug: true,
            logger: true,
        });

        const mailOptions = {
            from: "abbk8406@gmail.com",
            to: email,
            subject: "🎉 Welcome to Our Platform!",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                    <div style="text-align: center;">
                        <h2 style="color: #4CAF50;">Welcome, ${name}! 🎉</h2>
                        <p style="font-size: 16px; color: #555;">Thank you for registering with us.</p>
                    </div>
                    <div style="text-align: center; padding: 20px 0;">
                        <img src="https://cdn-icons-png.flaticon.com/512/1006/1006555.png" width="100" alt="Welcome">
                    </div>
                    <p style="font-size: 14px; color: #444; text-align: center;">
                        We're excited to have you on board. Explore our platform and enjoy the experience!
                    </p>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://yourwebsite.com/login" 
                            style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
                            Get Started
                        </a>
                    </div>
                    <p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px;">
                        If you have any questions, feel free to <a href="mailto:support@abbk8406.com">contact us</a>.
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Notification email sent successfully to", email);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
}



module.exports = router;
