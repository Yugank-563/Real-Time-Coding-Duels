import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    battleMode: {
      type: String,
      required: true
    },

    metadata: {
      difficulty: {
        type: String,
      },
      timeLimit: {
        type: Number,
      },
    },

    // acceptedAt and declinedAt removed since invitations are deleted upon resolution

    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    collection: 'battleinvitations',
  }
);

invitationSchema.index({ sender: 1, recipient: 1 });

invitationSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiresAt;
});

// Removed pre-save hooks for acceptedAt/declinedAt since invitations are deleted on those actions.

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;
