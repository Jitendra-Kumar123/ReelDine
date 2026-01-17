const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: {
            validator: function(email) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            message: 'Please enter a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    avatar: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: [200, 'Bio cannot exceed 200 characters'],
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    preferences: {
        cuisines: [{ type: String }],
        dietaryRestrictions: [{ type: String }],
        favoriteIngredients: [{ type: String }]
    },
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'foodpartner'
    }],
    followersCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
    return this.following.length;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
});

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
