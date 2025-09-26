const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', auth, authorize('admin'), async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            college,
            course,
            membershipStatus,
            search
        } = req.query;

        // Build query
        let query = {};
        
        if (college) query.branch = new RegExp(college, 'i');
        if (course) query.year = new RegExp(course, 'i');
        if (membershipStatus) query.membershipStatus = membershipStatus;
        if (search) {
            query.$or = [
                { fullName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        // Execute query with pagination
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.status(200).json({
            status: 'success',
            data: {
                users,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                total
            }
        });

    } catch (error) {
        next(error);
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        res.status(200).json({
            status: 'success',
            data: { user }
        });

    } catch (error) {
        next(error);
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', auth, async (req, res, next) => {
    try {
        const allowedUpdates = [
            'fullName', 'phoneNumber', 'branch', 'year',
            'domains', 'experience', 'portfolioUrl',
            'linkedinProfile', 'githubProfile', 'emailNotifications', 'privacy'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        next(error);
    }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
router.get('/stats', auth, authorize('admin', 'organizer'), async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeMembers = await User.countDocuments({ 
            membershipStatus: 'active', 
            isActive: true 
        });
        const pendingMembers = await User.countDocuments({ 
            membershipStatus: 'pending' 
        });
        const verifiedUsers = await User.countDocuments({ 
            isEmailVerified: true 
        });

        // Get user registration trends (last 12 months)
        const registrationTrends = await User.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Get branch distribution
        const collegeDistribution = await User.aggregate([
            {
                $group: {
                    _id: '$branch',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                overview: {
                    totalUsers,
                    activeMembers,
                    pendingMembers,
                    verifiedUsers
                },
                registrationTrends,
                branchDistribution: collegeDistribution
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;