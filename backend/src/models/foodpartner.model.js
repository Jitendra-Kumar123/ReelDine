const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const foodPartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
        maxlength: [100, 'Business name cannot exceed 100 characters']
    },
    contactName: {
        type: String,
        required: [true, 'Contact name is required'],
        trim: true,
        maxlength: [50, 'Contact name cannot exceed 50 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function(phone) {
                return /^[0-9+\-\s()]+$/.test(phone);
            },
            message: 'Please enter a valid phone number'
        }
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        maxlength: [200, 'Address cannot exceed 200 characters']
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
        select: false
    },
    logo: {
        type: String,
        default: null
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    cuisine: [{
        type: String,
        enum: ['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Thai', 'French', 'American', 'Mediterranean', 'Other']
    }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        },
        address: String
    },
    businessHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    followersCount: {
        type: Number,
        default: 0
    },
    totalVideos: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
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
foodPartnerSchema.index({ email: 1 });
foodPartnerSchema.index({ location: '2dsphere' });
foodPartnerSchema.index({ cuisine: 1 });
foodPartnerSchema.index({ createdAt: -1 });

// Virtual for followers count
foodPartnerSchema.virtual('followersCountVirtual').get(function() {
    return this.followers.length;
});

// Pre-save middleware to hash password
foodPartnerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
foodPartnerSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Instance method to generate password reset token
foodPartnerSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Static method to find by email
foodPartnerSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to find nearby partners
foodPartnerSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
    return this.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistance
            }
        },
        isActive: true
    });
};

const foodPartnerModel = mongoose.model('foodpartner', foodPartnerSchema);

module.exports = foodPartnerModel;
