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
      topic: {
        type: String,
      },
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

invitationSchema.index({ sender: 1, recipient: 1 });

invitationSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiresAt;
});

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;
