import HelpMessage from '../models/HelpMessage.js';

// POST /api/help  — any logged-in user sends a help request
export const createHelpMessage = async (req, res) => {
  const { subject, message } = req.body;
  const { userId, name } = req.user;

  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required.' });
  }

  try {
    const helpMsg = await HelpMessage.create({
      fromUserId: userId,
      fromUserName: name,
      subject,
      message,
    });
    res.status(201).json(helpMsg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/help  — operators fetch all help messages
export const getAllHelpMessages = async (req, res) => {
  try {
    const messages = await HelpMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/help/unread-count  — count of 'open' messages for badge
export const getUnreadCount = async (req, res) => {
  try {
    const count = await HelpMessage.countDocuments({ status: 'open' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/help/:id/reply  — any participant (user or operator) replies to a message
export const replyToHelpMessage = async (req, res) => {
  const { reply } = req.body;
  const { userId, name } = req.user;

  if (!reply) {
    return res.status(400).json({ message: 'Reply message is required.' });
  }

  const isOperatorUser = userId === 'tata_operator' || userId === 'operator1';

  try {
    const helpMsg = await HelpMessage.findById(req.params.id);
    if (!helpMsg) return res.status(404).json({ message: 'Help message not found.' });

    helpMsg.replies.push({
      fromOperator: isOperatorUser ? name : '',
      fromUserId:   userId,
      fromUserName: name,
      senderType:   isOperatorUser ? 'operator' : 'user',
      message: reply,
    });

    // Only update status to 'replied' when an operator replies
    if (isOperatorUser) {
      helpMsg.status = 'replied';
    }

    await helpMsg.save();
    res.json(helpMsg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/help/:id/close  — operator closes a ticket
export const closeHelpMessage = async (req, res) => {
  try {
    const helpMsg = await HelpMessage.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );
    if (!helpMsg) return res.status(404).json({ message: 'Help message not found.' });
    res.json(helpMsg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
