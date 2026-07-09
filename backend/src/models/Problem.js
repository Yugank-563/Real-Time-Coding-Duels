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
    content: {
      type: String,
    },

    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    tags: [
      {
        type: String,
      },
    ],
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
      { _id: false }
    ],
    boilerplates: {
      type: Map,
      of: String,
      default: {},
    },

    testCaseConfig: {
      totalCount: {
        type: Number,
        default: 0,
      },
      folderPath: {
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
