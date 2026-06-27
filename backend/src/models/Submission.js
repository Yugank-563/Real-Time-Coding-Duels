import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    battleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Battle',
      default: null,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    verdict: {
      type: String,
      enum: ['AC', 'WA', 'TLE', 'MLE', 'CE', 'RE', 'pending'],
      default: 'pending',
    },
    executionTime: {
      type: Number, // in ms
      default: 0,
    },
    memory: {
      type: Number, // in KB
      default: 0,
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    // Per-case results from batch execution (populated by compiler-service)
    results: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    // The original test cases array (inputs, expected outputs) for zipping results
    testCases: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    errorMessage: {
      type: String,
      default: '',
    },
    output: {
      type: String,
      default: '',
    },
    improvedCode: {
      type: String,
      default: null,
    },
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    aiAnalysisStatus: {
      type: String,
      enum: ['none', 'pending', 'completed', 'failed', 'expired'],
      default: 'none',
    },
    aiAnalysisGeneratedAt: {
      type: Date,
      default: null,
    },
    aiAnalysisExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for polling submission status by ID (already indexed via _id)
// Index for fetching user-specific submissions
submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ verdict: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
