const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Food name is required'],
        trim: true,
        maxlength: [100, 'Food name cannot exceed 100 characters']
    },
    video: {
        type: String,
        required: [true, 'Video URL is required']
    },
    thumbnail: {
        type: String,
        default: null
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    ingredients: [{
        name: String,
        quantity: String,
        unit: String
    }],
    cuisine: {
        type: String,
        enum: ['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Thai', 'French', 'American', 'Mediterranean', 'Other'],
        default: 'Other'
    },
    dietaryInfo: [{
        type: String,
        enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb', 'Keto', 'Halal', 'Kosher']
    }],
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    cookingTime: {
        type: Number, // in minutes
        min: 1,
        max: 480 // 8 hours max
    },
    servings: {
        type: Number,
        min: 1,
        max: 50,
        default: 1
    },
    nutritionalInfo: {
        calories: Number,
        protein: Number, // in grams
        carbs: Number, // in grams
        fat: Number, // in grams
        fiber: Number // in grams
    },
    price: {
        type: Number,
        min: 0
    },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'foodpartner',
        required: [true, 'Food partner is required']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    likeCount: {
        type: Number,
        default: 0
    },
    savesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    featuredUntil: Date,
    aiGenerated: {
        type: Boolean,
        default: false
    },
    aiMetadata: {
        suggestedTags: [String],
        difficulty: String,
        cookingTime: Number,
        ingredients: [String]
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for better performance
foodSchema.index({ foodPartner: 1 });
foodSchema.index({ cuisine: 1 });
foodSchema.index({ tags: 1 });
foodSchema.index({ location: '2dsphere' });
foodSchema.index({ createdAt: -1 });
foodSchema.index({ likeCount: -1 });
foodSchema.index({ viewCount: -1 });
foodSchema.index({ isFeatured: -1, createdAt: -1 });

// Virtual for engagement score
foodSchema.virtual('engagementScore').get(function() {
    return (this.likeCount * 2) + (this.savesCount * 3) + (this.commentsCount * 4) + (this.viewCount * 0.1);
});

// Pre-save middleware to update food partner video count
foodSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const FoodPartner = mongoose.model('foodpartner');
            await FoodPartner.findByIdAndUpdate(this.foodPartner, { $inc: { totalVideos: 1 } });
        } catch (error) {
            // Log error but don't fail the save
            console.error('Error updating food partner video count:', error);
        }
    }
    next();
});

// Post-remove middleware to update food partner video count
foodSchema.post('remove', async function() {
    try {
        const FoodPartner = mongoose.model('foodpartner');
        await FoodPartner.findByIdAndUpdate(this.foodPartner, { $inc: { totalVideos: -1 } });
    } catch (error) {
        console.error('Error updating food partner video count on delete:', error);
    }
});

// Static method to find nearby foods
foodSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
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
    }).populate('foodPartner', 'name logo rating');
};

// Static method to find trending foods
foodSchema.statics.findTrending = function(limit = 20) {
    return this.find({ isActive: true })
        .sort({ engagementScore: -1, createdAt: -1 })
        .limit(limit)
        .populate('foodPartner', 'name logo rating');
};

// Static method to find featured foods
foodSchema.statics.findFeatured = function() {
    return this.find({
        isActive: true,
        isFeatured: true,
        $or: [
            { featuredUntil: { $exists: false } },
            { featuredUntil: { $gt: new Date() } }
        ]
    }).populate('foodPartner', 'name logo rating');
};

const foodModel = mongoose.model('food', foodSchema);

module.exports = foodModel;
