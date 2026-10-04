import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  fromOperator: { type: String, default: '' },   // operator name (kept for backward compat)
  fromUserId:   { type: String, default: '' },   // userId of sender
  fromUserName: { type: String, default: '' },   // display name of sender
  senderType:   { type: String, enum: ['user', 'operator'], default: 'operator' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const helpMessageSchema = new mongoose.Schema(
  {
    fromUserId: { type: String, required: true },   // userId of sender
    fromUserName: { type: String, required: true }, // display name
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'replied', 'closed'],
      default: 'open',
    },
    replies: [replySchema],
  },
  { timestamps: true }
);

const HelpMessage = mongoose.model('HelpMessage', helpMessageSchema);

export default HelpMessage;
