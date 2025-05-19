const { Op } = require("sequelize");
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const { registerSchema } = require("../schemas/user.schema");
const {generateToken, generateEmailVerificationToken} = require("../utils/jwtUtils");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
/**
 * Register user
 * POST /ap/users/register
 */

exports.registerUser = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((d) => d.message),
      });
    }
    const { username, email, password, birthday, role: reqRole } = value;
    // Check if user already exists
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //save the user in the database
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      birthday,
      role: reqRole || "user",
      emailVerified: false,
    });
    //generate auth token
    const token = generateToken(user);
    //Omit passsword from the response
    const userResponse = user.toJSON();
    delete userResponse.password;

    // Generate email verification token
    const verificationToken =generateEmailVerificationToken(user);
    //Trigger email verification
    const verificationLink = `${process.env.BASE_URL}/api/users/verify-email?token=${verificationToken}`;
    // Compose email content
    const subject = "Verify Your Email Address";
    const html = `
  <h2>Hello ${user.username},</h2>
  <p>Thank you for registering. Please click the link below to verify your email address:</p>
  <a href="${verificationLink}">Verify Email</a>
  <p>This link will expire in 24 hours.</p>
`;

    // Send email
    await sendEmail(user.email, subject, html);
    res.status(201).json({
      success: true,
      data: userResponse,
      token,
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering user: " + error.message,
    });
  }
};

/**
 * Verify email
 * API GET /api/users/verify-email
 */
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.emailVerified = true;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * Login user
 */

exports.loginUser= async (req,res)=>{
    try {
        conat 
    } catch (error) {
        
    }
}


exports.loginUser = async (req, res) => {
    const { identifier, password } = req.body; // identifier = email or username
  
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email/username and password",
      });
    }
  
    try {
      // Find user by email or username
      const user = await User.findOne({
        where: { [Op.or]: [{ email: identifier }, { username: identifier }] },
      });
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }
  
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }
  
      // Optionally, check if email verified before allowing login
      if (!user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email before logging in.",
        });
      }
  
      // Generate token
      const token = generateToken(user);
  
      // Send response without password
      const userResponse = user.toJSON();
      delete userResponse.password;
  
      res.status(200).json({
        success: true,
        data: userResponse,
        token,
        message: "Login successful",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  };
  /**
   * Forgot password
   * /api/user/forgot-password
   */

  exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }
  
    try {
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No user found with this email",
        });
      }
  
      // Generate a reset token (random string)
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
  
      // Save to user model
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();
  
      // Create reset link
      const resetLink = `${process.env.BASE_URL}/api/users/reset-password?token=${resetToken}`;
  
      // Compose email
      const subject = "Password Reset Request";
      const html = `
        <h2>Hello ${user.username},</h2>
        <p>You requested to reset your password. Please click the link below to set a new password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;
  
      // Send email
      await sendEmail(user.email, subject, html);
  
      res.status(200).json({
        success: true,
        message: "Password reset link sent to your email.",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  };

  /**
   * Reset Password
   * POST
   * /api/users/reset-password
   */

  exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
  
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }
  
    try {
      const user = await User.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: { [Op.gt]: Date.now() }, // token still valid
        },
      });
  
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }
  
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update user password and clear reset fields
      user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Password reset successful. You can now login with your new password.",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  };
  
