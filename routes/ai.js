const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const chatbot = require('../services/aiChatbot');

// Chatbot API endpoint
router.post('/chatbot', ensureAuthenticated, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user ? req.user._id : null;
        const response = await chatbot.handleMessage(message, userId);
        res.json(response);
    } catch (error) {
        console.error('Chatbot error:', error.message);
        res.status(500).json({ text: 'Sorry, something went wrong. Please try again.', products: [] });
    }
});

// Chatbot page
router.get('/chatbot', ensureAuthenticated, (req, res) => {
    res.render('customer/chatbot', {
        aiEnabled: chatbot.isAIEnabled(),
        aiProvider: chatbot.getProvider()
    });
});

module.exports = router;
