const express = require("express");
const router = express.Router();
const { registerUser, verifyEmail, loginUser, forgotPassword, resetPassword } = require("../controllers/User.controller");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - birthday
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: StrongPass123!
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: user
 *     responses:
 *       201:
 *         description: User registered successfully, verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     birthday:
 *                       type: string
 *                     role:
 *                       type: string
 *                 token:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation failed or user exists
 *       500:
 *         description: Server error
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/users/verify-email:
 *   get:
 *     summary: Verify user's email address
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Email verification token sent via email
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 */
router.get("/verify-email", verifyEmail);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login with email or username and password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or username
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       500:
 *          description: Server Error
 *       403:
 *          description: Please verify your email before logging in
 *       401:
 *         desription: Invalid credentials
 */
router.post("/login", loginUser);
/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Send a password reset email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset link sent
 *       400:
 *        description: Please provide your email address
 *        404:
 *         description: No user found with this email
 *        500:
 *          description: Server Error
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *          description: Invalid or expired reset token
 *       
 *       500:
 *          description: Server Error 
 */      
router.post("/reset-password",resetPassword);

module.exports = router;
