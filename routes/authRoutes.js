// routes/authRoutes.js

const express = require('express');
const { signup, login, forgotPassword, resetPassword } = require('../controllers/authController');
const { body } = require('express-validator');
const validate = require('../middleware/validateRequest');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User signup, login, and password reset
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber 
 *               - password
 *               - country 
 *               - stateOrRegion
 *               - city 
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: 233247157301
 *               password:
 *                 type: string
 *                 format: password
 *                 example: s3cr3tPass!
 *               country:
 *                 type: string
 *                 example: Ghana
 *               stateOrRegion:
 *                 type: string
 *                 example: Greater Accra
 *               city:
 *                 type: string
 *                 example: Accra
 *               role:
 *                 type: string
 *                 example: Coach
 *     responses:
 *       201:
 *         description: User registered successfully, JWT returned
 *       400:
 *         description: Validation errors
 */
router.post(
  '/signup',
  [
    body('firstName').notEmpty().withMessage('First Name is required'),
    body('lastName').notEmpty().withMessage('Last Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phoneNumber').notEmpty().withMessage('Phone Number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('country').notEmpty().withMessage('Country is required'),
    body('stateOrRegion').notEmpty().withMessage('State Or Region is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('role').notEmpty().withMessage('Role is required'),
  ],
  validate,
  signup
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login and receive a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: s3cr3tPass!
 *     responses:
 *       200:
 *         description: Login successful, JWT returned
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').exists().withMessage('Password is required'),
  ],
  validate,
  login
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request a password reset OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP sent to user email
 *       404:
 *         description: User not found
 */
router.post(
  '/forgot-password',
  [ body('email').isEmail().withMessage('Valid email is required') ],
  validate,
  forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset password using OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: n3wP@ssword
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: OTP invalid or expired
 */
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  resetPassword
);

module.exports = router;
