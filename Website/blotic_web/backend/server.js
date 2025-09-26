const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../'), {
  extensions: ['html'],
  index: 'index.html'
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'BLOTIC Backend Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Serve frontend files for any non-API routes
app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
        return;
    }
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    // Close server & exit process
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    console.error(err.stack);
    process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 BLOTIC Backend Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;