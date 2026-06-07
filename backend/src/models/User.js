import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      default: null,
    },

    name: {
      type: String,
      default: '',
      maxlength: 50,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    rank: {
      type: Number,
      default: 1200,
    },

    xp: {
      type: Number,
      default: 0,
    },

    level: {
      type: Number,
      default: 1,
    },

    streaks: {
      type: Number,
      default: 0,
    },

    badges: [
      {
        type: String,
      },
    ],

    // ── Profile Fields ──
    bio: {
      type: String,
      default: '',
      maxlength: 250,
    },

    country: {
      type: String,
      default: '',
    },

    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
