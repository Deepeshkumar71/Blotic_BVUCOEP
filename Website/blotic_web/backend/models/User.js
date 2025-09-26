const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
    // Personal Information
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't include password in queries by default
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
    },

    // Academic Information
    branch: {
        type: String,
        required: [true, 'Branch is required'],
        trim: true,
        enum: ['CSE', 'CSBS', 'CE', 'IT', 'ROBOTICS', 'ECE', 'E&TC', 'E&CE', 'MECHANICAL', 'CHEMICAL', 'CIVIL', 'Other']
    },
    year: {
        type: String,
        required: [true, 'Year is required'],
        enum: ['1', '2', '3', '4', 'Alumni', 'Faculty', 'Other']
    },

    // BLOTIC Specific
    domains: [{
        type: String,
        enum: [
            'Marketing',
            'Com-rel / PR',
            'Dev-rel',
            'Social Media',
            'Event Management',
            'Designing',
            'Content',
            'Creativity',
            'Research'
        ]
    }],
    experience: {
        type: String,
        maxlength: [500, 'Experience cannot exceed 500 characters']
    },

    portfolioUrl: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, 'Please enter a valid URL']
    },
    linkedinProfile: {
        type: String,
        trim: true,
        match: [/^https?:\/\/(www\.)?linkedin\.com\/.*/, 'Please enter a valid LinkedIn URL']
    },
    githubProfile: {
        type: String,
        trim: true,
        match: [/^https?:\/\/(www\.)?github\.com\/.*/, 'Please enter a valid GitHub URL']
    },

    // Account Status
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['member', 'organizer', 'admin'],
        default: 'member'
    },
    membershipStatus: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'expired'],
        default: 'pending'
    },
    joinedDate: {
        type: Date,
        default: Date.now
    },

    // Verification and Security
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,

    // Activity Tracking
    lastLogin: Date,
    lastActive: Date,

    // Preferences
    emailNotifications: {
        events: { type: Boolean, default: true },
        workshops: { type: Boolean, default: true },
        announcements: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: false }
    },
    privacy: {
        showProfile: { type: Boolean, default: true },
        showContact: { type: Boolean, default: false },
        showProjects: { type: Boolean, default: true }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ branch: 1 });
userSchema.index({ membershipStatus: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with salt rounds from environment
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
});

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return token;
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    
    return token;
};

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// Static method to get active members count
userSchema.statics.getActiveMembersCount = function() {
    return this.countDocuments({ 
        isActive: true, 
        membershipStatus: 'active' 
    });
};

module.exports = mongoose.model('User', userSchema);