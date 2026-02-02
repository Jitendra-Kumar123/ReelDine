const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Challenge description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  theme: {
    type: String,
    required: [true, 'Challenge theme is required'],
    enum: ['cooking', 'baking', 'healthy', 'quick', 'budget', 'fusion', 'traditional']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  duration: {
    type: Number, // in days
    required: [true, 'Challenge duration is required'],
    min: 1,
    max: 30
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  rules: [{
    type: String,
    trim: true
  }],
  prizes: [{
    position: Number,
    description: String,
    value: Number
  }],
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    submissions: [{
      food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food'
      },
      submittedAt: {
        type: Date,
        default: Date.now
      },
      votes: {
        type: Number,
        default: 0
      }
    }]
  }],
  maxParticipants: {
    type: Number,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Creator is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
challengeSchema.index({ theme: 1 });
challengeSchema.index({ startDate: 1, endDate: 1 });
challengeSchema.index({ isActive: 1, createdAt: -1 });

// Virtual for participant count
challengeSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for total submissions
challengeSchema.virtual('totalSubmissions').get(function() {
  return this.participants.reduce((total, participant) => total + participant.submissions.length, 0);
});

// Static method to find active challenges
challengeSchema.statics.findActive = function() {
  return this.find({
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  }).populate('createdBy', 'fullName avatar');
};

// Static method to find upcoming challenges
challengeSchema.statics.findUpcoming = function() {
  return this.find({
    isActive: true,
    startDate: { $gt: new Date() }
  }).populate('createdBy', 'fullName avatar');
};

const challengeModel = mongoose.model('challenge', challengeSchema);

module.exports = challengeModel;
