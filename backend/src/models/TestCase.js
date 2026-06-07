import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['sample', 'hidden', 'edge', 'boundary', 'random', 'stress'],
      default: 'hidden',
    },
    caseNumber: {
      type: Number,
      required: true,
    },
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      default: '',
    },
    isGenerated: {
      type: Boolean,
      default: true,
    },
    metadata: {
      // Optional field for storing limits reached (e.g. max_array_size, int_overflow)
      type: mongoose.Schema.Types.Mixed,
    }
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient ordered retrieval of a problem's testcases
testCaseSchema.index({ problemId: 1, caseNumber: 1 });

const TestCase = mongoose.model('TestCase', testCaseSchema);

export default TestCase;
