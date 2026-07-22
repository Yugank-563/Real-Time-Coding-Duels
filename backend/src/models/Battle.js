import mongoose from 'mongoose';

const battleSchema = new mongoose.Schema(
  {
    players: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        score: {
          type: Number,
          default: 0,
        },
        status: {
          type: String,
          enum: ['not_ready', 'ready', 'coding', 'testing', 'submitted', 'surrendered'],
          default: 'not_ready',
        },
        progress: {
          type: Number, // completed test cases count
          default: 0,
        },
        language: {
          type: String,
          default: '',
        },
        ratingChange: {
          type: Number,
          default: 0,
        },
      },
    ],
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    battleType: {
      type: String,
      enum: ['random-duel', 'timed-sprint', 'topic-duel'],
      required: true,
    },
    mode: {
      type: String,
      enum: ['ranked', 'casual'],
      required: true,
      default: 'ranked',
    },

    isCasual: {
      type: Boolean,
      default: false,
    },

    timeLimit: {
      type: Number,
      default: 1200, // in seconds
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    topic: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'ended'],
      default: 'waiting',
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    submissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for leaderboard battle stats aggregation
battleSchema.index({ status: 1 });
// Compound index for player-specific battle lookups
battleSchema.index({ 'players.user': 1, status: 1 });

const Battle = mongoose.model('Battle', battleSchema);

export default Battle;
