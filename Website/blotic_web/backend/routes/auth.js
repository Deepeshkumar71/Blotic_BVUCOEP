const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
    // Validation middleware
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('phoneNumber')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please enter a valid 10-digit Indian mobile number'),
    body('branch')
        .isIn(['CSE', 'CSBS', 'CE', 'IT', 'ROBOTICS', 'ECE', 'E&TC', 'E&CE', 'MECHANICAL', 'CHEMICAL', 'CIVIL', 'Other'])
        .withMessage('Please select a valid branch'),
    body('year')
        .isIn(['1', '2', '3', '4', 'Alumni', 'Faculty', 'Other'])
        .withMessage('Please select a valid year')
], async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            fullName, email, password, phoneNumber, branch, year, domains,
            experience, portfolioUrl, linkedinProfile, githubProfile
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        // Create user
        const user = new User({
            fullName,
            email,
            password,
            phoneNumber,
            branch,
            year,
            domains,
            experience,
            portfolioUrl,
            linkedinProfile,
            githubProfile
        });

        await user.save();

        // Generate email verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // Send verification email
        try {
            const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
            await sendEmail({
                email: user.email,
                subject: 'BLOTIC - Verify Your Email',
                template: 'emailVerification',
                data: {
                    name: user.fullName,
                    verificationUrl
                }
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail registration if email fails
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            status: 'success',
            message: 'Registration successful! Please check your email to verify your account.',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    branch: user.branch,
                    year: user.year,
                    membershipStatus: user.membershipStatus,
                    isEmailVerified: user.isEmailVerified
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password, rememberMe } = req.body;

        // Find user by email and include password
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(423).json({
                status: 'error',
                message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            // Increment login attempts
            await user.incLoginAttempts();
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Update last login
        user.lastLogin = new Date();
        user.lastActive = new Date();
        await user.save();

        // Generate JWT token
        const tokenExpiry = rememberMe ? '30d' : process.env.JWT_EXPIRE;
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: tokenExpiry }
        );

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    branch: user.branch,
                    year: user.year,
                    membershipStatus: user.membershipStatus,
                    isEmailVerified: user.isEmailVerified,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    branch: user.branch,
                    year: user.year,
                    domains: user.domains,
                    membershipStatus: user.membershipStatus,
                    isEmailVerified: user.isEmailVerified,
                    role: user.role,
                    joinedDate: user.joinedDate,
                    lastLogin: user.lastLogin
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', auth, async (req, res, next) => {
    try {
        // Update last active time
        await User.findByIdAndUpdate(req.user.id, {
            lastActive: new Date()
        });

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', async (req, res, next) => {
    try {
        // Hash the token from URL
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired verification token'
            });
        }

        // Update user
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        user.membershipStatus = 'active'; // Activate membership after email verification

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully! Your BLOTIC membership is now active.'
        });

    } catch (error) {
        next(error);
    }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Please enter a valid email',
                errors: errors.array()
            });
        }

        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            // Don't reveal if email exists or not
            return res.status(200).json({
                status: 'success',
                message: 'If an account with that email exists, a password reset email has been sent.'
            });
        }

        // Generate reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        // Send reset email
        try {
            const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
            await sendEmail({
                email: user.email,
                subject: 'BLOTIC - Password Reset Request',
                template: 'passwordReset',
                data: {
                    name: user.fullName,
                    resetUrl
                }
            });

            res.status(200).json({
                status: 'success',
                message: 'Password reset email sent successfully'
            });

        } catch (emailError) {
            user.passwordResetToken = undefined;
            user.passwordResetExpire = undefined;
            await user.save();

            return res.status(500).json({
                status: 'error',
                message: 'Email could not be sent. Please try again later.'
            });
        }

    } catch (error) {
        next(error);
    }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
router.put('/reset-password/:token', [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Password validation failed',
                errors: errors.array()
            });
        }

        // Hash the token from URL
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        user.loginAttempts = 0;
        user.lockUntil = undefined;

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password reset successful. Please log in with your new password.'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;