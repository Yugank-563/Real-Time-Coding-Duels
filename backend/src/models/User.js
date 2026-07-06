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

    isVerified: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 1200,
      index: true,
    },

    // Profile Fields
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

// Index for finding user by refresh token (sparse index)
userSchema.index({ refreshToken: 1 }, { sparse: true });

const User = mongoose.model('User', userSchema);

export default User;
