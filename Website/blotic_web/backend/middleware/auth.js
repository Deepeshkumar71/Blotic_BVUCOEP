const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Access denied. No valid token provided.'
            });
        }

        // Extract token
        const token = authHeader.substring(7);

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from token
            const user = await User.findById(decoded.id);
            
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token is valid but user not found'
                });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Account has been deactivated'
                });
            }

            // Add user to request object
            req.user = user;
            next();

        } catch (tokenError) {
            if (tokenError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token has expired'
                });
            } else if (tokenError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid token'
                });
            } else {
                throw tokenError;
            }
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during authentication'
        });
    }
};

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                
                if (user && user.isActive) {
                    req.user = user;
                }
            } catch (tokenError) {
                // Silently fail for optional auth
                console.log('Optional auth failed:', tokenError.message);
            }
        }
        
        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next();
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Access denied. Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

module.exports = { auth, optionalAuth, authorize };