const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.error('❌ Error:', err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = {
            message,
            status: 'error',
            statusCode: 404
        };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = {
            message,
            status: 'error',
            statusCode: 400
        };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        error = {
            message: 'Validation Error',
            status: 'error',
            statusCode: 400,
            errors
        };
    }

    // JWT Error
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = {
            message,
            status: 'error',
            statusCode: 401
        };
    }

    // JWT Expired
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = {
            message,
            status: 'error',
            statusCode: 401
        };
    }

    // Rate limit error
    if (err.name === 'RateLimitError') {
        error = {
            message: 'Too many requests, please try again later',
            status: 'error',
            statusCode: 429
        };
    }

    res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        message: error.message || 'Server Error',
        ...(error.errors && { errors: error.errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;