import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    titleSlug: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    source: {
      type: String,
      default: 'leetcode',
    },
    sourceUrl: {
      type: String,
    },
    content: {
      type: String,
    },
    examples: {
      type: String,
    },
    hints: [
      {
        type: String,
      },
    ],
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      default: 'Medium',
    },
    tags: [
      {
        type: String,
      },
    ],
    constraints: {
      timeLimit: {
        type: Number, // in seconds
        default: 2,
      },
      memoryLimit: {
        type: Number, // in MB
        default: 256,
      },
    },
    testCases: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          default: '',
        },
        isSample: {
          type: Boolean,
          default: false,
        },
      },
    ],
    boilerplates: {
      cpp: {
        type: String,
        default: '',
      },
    },
    lastFetchAttempt: {
      type: Date,
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
