import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
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
          required: true,
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
  },
  {
    timestamps: true,
  }
);

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
