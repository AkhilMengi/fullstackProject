const express = require('express');
const { userAuth } = require('../middlewares/auth');
const Chat = require('../models/chat');

const chatRouter = express.Router();

chatRouter.get('/chat/:targetId', userAuth, async (req, res) => {
  try {
    const currentUser = req.user._id;
    const targetId = req.params.targetId; // ✅ FIX: targetId is an ID, not an object

    let chat = await Chat.findOne({
      participants: { $all: [currentUser, targetId] }
    }).populate('messages.senderId', 'firstName _id lastName'); // optional: populate sender info

    if (!chat) {
      chat = new Chat({
        participants: [currentUser, targetId],
        messages: []
      });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load chat' });
  }
});

module.exports = chatRouter;
