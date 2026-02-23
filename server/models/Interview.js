import mongoose from 'mongoose';

const interviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    jobRole: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true
    },
    interviewType: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    // New Structured Data
    summary: {
        title: String,
        overview: String,
        notes: [{
            topic: String,
            details: [String]
        }]
    },
    // Full Transcript with Timestamps
    transcript: [{
        sender: String,
        text: String,
        timestamp: String
    }],
    feedback: { // Keeping simple feedback as fallback or additional data
        strengths: [String],
        improvements: [String],
        suggestedTopics: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
