const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const chatbot = require('../services/aiChatbot');
const recommendations = require('../services/aiRecommendations');
const search = require('../services/aiSearch');

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

// Get similar products (AJAX endpoint)
router.get('/recommendations/similar/:id', async (req, res) => {
    try {
        const products = await recommendations.getSimilarProducts(req.params.id, 4);
        res.json(products);
    } catch (error) {
        res.json([]);
    }
});

// Get "Customers Also Bought" (AJAX endpoint)
router.get('/recommendations/also-bought/:id', async (req, res) => {
    try {
        const products = await recommendations.getCustomersAlsoBought(req.params.id, 4);
        res.json(products);
    } catch (error) {
        res.json([]);
    }
});

// Get trending products (AJAX endpoint)
router.get('/recommendations/trending', async (req, res) => {
    try {
        const products = await recommendations.getTrendingProducts(8);
        res.json(products);
    } catch (error) {
        res.json([]);
    }
});

// Get personalized recommendations (AJAX endpoint)
router.get('/recommendations/personalized', ensureAuthenticated, async (req, res) => {
    try {
        const products = await recommendations.getPersonalizedRecommendations(req.user._id, 8);
        res.json(products);
    } catch (error) {
        res.json([]);
    }
});

// Search suggestions (AJAX endpoint)
router.get('/search/suggestions', async (req, res) => {
    try {
        const { q } = req.query;
        const suggestions = await search.getSuggestions(q);
        res.json(suggestions);
    } catch (error) {
        res.json([]);
    }
});

module.exports = router;
