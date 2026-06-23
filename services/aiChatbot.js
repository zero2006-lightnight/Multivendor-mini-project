const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * AI Chatbot Service
 * Supports three modes:
 * 1. Rule-based (no API key needed) - handles common queries
 * 2. OpenRouter (recommended) - free models + paid models, cheaper than OpenAI
 * 3. OpenAI (optional) - direct OpenAI API
 */

let openai = null;
let aiProvider = 'rule-based';

try {
    const OpenAI = require('openai');

    if (process.env.OPENROUTER_API_KEY) {
        // OpenRouter mode - supports free and cheap models
        openai = new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: 'https://openrouter.ai/api/v1',
            defaultHeaders: {
                'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
                'X-OpenRouter-Title': 'Multi-Vendor Marketplace'
            }
        });
        aiProvider = 'openrouter';
        console.log('AI Chatbot: OpenRouter mode enabled');
    } else if (process.env.OPENAI_API_KEY) {
        // Direct OpenAI mode
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        aiProvider = 'openai';
        console.log('AI Chatbot: OpenAI mode enabled');
    } else {
        console.log('AI Chatbot: Rule-based mode (no API key configured)');
    }
} catch (err) {
    console.log('AI not configured, using rule-based chatbot:', err.message);
}

// Intent detection keywords
const INTENTS = {
    greeting: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    product_search: ['find', 'search', 'show', 'looking for', 'do you have', 'where can i find'],
    price_query: ['price', 'cost', 'how much', 'expensive', 'cheap', 'budget'],
    order_status: ['order', 'delivery', 'shipping', 'track', 'where is my order'],
    stock_check: ['stock', 'available', 'in stock', 'out of stock', 'availability'],
    return_policy: ['return', 'refund', 'exchange', 'money back'],
    contact: ['contact', 'support', 'help', 'talk to', 'speak with'],
    categories: ['category', 'categories', 'what do you sell', 'what products', 'browse'],
    recommendation: ['recommend', 'suggestion', 'what should i buy', 'popular', 'trending', 'best seller']
};

// Detect user intent from message
function detectIntent(message) {
    const lower = message.toLowerCase();
    for (const [intent, keywords] of Object.entries(INTENTS)) {
        if (keywords.some(kw => lower.includes(kw))) {
            return intent;
        }
    }
    return 'unknown';
}

// Extract search terms from message
function extractSearchTerms(message) {
    const lower = message.toLowerCase();
    const stopWords = ['i', 'me', 'my', 'we', 'you', 'the', 'a', 'an', 'is', 'are', 'do', 'does', 'have', 'has', 'can', 'could', 'would', 'want', 'need', 'looking', 'for', 'find', 'show', 'me', 'search'];
    return lower.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
}

// Generate rule-based response
async function generateRuleResponse(message, userId) {
    const intent = detectIntent(message);
    const terms = extractSearchTerms(message);

    switch (intent) {
        case 'greeting': {
            return {
                text: "Hello! 👋 Welcome to our marketplace! I'm here to help you find products, check orders, or answer any questions. How can I assist you today?",
                products: []
            };
        }

        case 'product_search': {
            if (terms.length > 0) {
                const query = { $or: [] };
                terms.forEach(term => {
                    query.$or.push({ name: { $regex: term, $options: 'i' } });
                    query.$or.push({ description: { $regex: term, $options: 'i' } });
                    query.$or.push({ category: { $regex: term, $options: 'i' } });
                });
                const products = await Product.find(query).limit(5);
                if (products.length > 0) {
                    const list = products.map(p => `• ${p.name} - ₹${p.price.toFixed(2)} (${p.category})`).join('\n');
                    return {
                        text: `I found ${products.length} product(s) matching your search:\n${list}\n\nClick on any product to view details!`,
                        products
                    };
                }
                return { text: "Sorry, I couldn't find any products matching your search. Try different keywords or browse our categories!", products: [] };
            }
            return { text: "What product are you looking for? You can tell me the name, category, or describe what you need.", products: [] };
        }

        case 'price_query': {
            if (terms.length > 0) {
                const query = { $or: [] };
                terms.forEach(term => {
                    query.$or.push({ name: { $regex: term, $options: 'i' } });
                    query.$or.push({ category: { $regex: term, $options: 'i' } });
                });
                const products = await Product.find(query).sort({ price: 1 }).limit(5);
                if (products.length > 0) {
                    const list = products.map(p => `• ${p.name} - ₹${p.price.toFixed(2)}`).join('\n');
                    return { text: `Here are the prices I found:\n${list}`, products };
                }
            }
            return { text: "Our products range from ₹99 to ₹49,999. Use the search bar to filter by price range, or tell me what product you're interested in!", products: [] };
        }

        case 'stock_check': {
            if (terms.length > 0) {
                const query = { $or: [] };
                terms.forEach(term => {
                    query.$or.push({ name: { $regex: term, $options: 'i' } });
                });
                const products = await Product.find(query).limit(5);
                if (products.length > 0) {
                    const list = products.map(p => `• ${p.name}: ${p.stock > 0 ? `✅ In Stock (${p.stock} available)` : '❌ Out of Stock'}`).join('\n');
                    return { text: `Stock availability:\n${list}`, products };
                }
            }
            return { text: "Tell me which product you'd like to check stock for, and I'll look it up for you!", products: [] };
        }

        case 'order_status': {
            if (userId) {
                const orders = await Order.find({ customer: userId }).sort({ createdAt: -1 }).limit(3);
                if (orders.length > 0) {
                    const list = orders.map(o => `• Order #${o._id.toString().slice(-6)}: ${o.status} (₹${o.totalAmount.toFixed(2)})`).join('\n');
                    return { text: `Here are your recent orders:\n${list}\n\nVisit your order history for more details!`, products: [] };
                }
                return { text: "You don't have any orders yet. Start shopping and place your first order!", products: [] };
            }
            return { text: "Please log in to check your order status. You can view all your orders in the Order History section.", products: [] };
        }

        case 'return_policy': {
            return {
                text: "📋 **Return Policy:**\n\n• Returns accepted within 7 days of delivery\n• Product must be unused and in original packaging\n• Refund processed within 5-7 business days\n• Contact support for return requests\n\nNeed help with a specific order? I can look that up for you!",
                products: []
            };
        }

        case 'recommendation': {
            const products = await Product.find().sort({ createdAt: -1 }).limit(5);
            if (products.length > 0) {
                const list = products.map(p => `• ${p.name} - ₹${p.price.toFixed(2)} (${p.category})`).join('\n');
                return { text: `🌟 Here are some trending products you might like:\n${list}`, products };
            }
            return { text: "Check out our latest products on the homepage! We have electronics, fashion, home goods, and more.", products: [] };
        }

        case 'categories': {
            const categories = await Product.distinct('category');
            return {
                text: `📂 **Our Categories:**\n${categories.map(c => `• ${c}`).join('\n')}\n\nBrowse products by category using the filter on the homepage!`,
                products: []
            };
        }

        case 'contact': {
            return {
                text: "📞 **Contact Support:**\n\n• Email: support@marketplace.com\n• Available 24/7 via this chat\n• For urgent issues, email us directly\n\nHow else can I help you?",
                products: []
            };
        }

        default: {
            // Try to search for products with the full message
            if (terms.length > 0) {
                const query = { $or: [] };
                terms.forEach(term => {
                    query.$or.push({ name: { $regex: term, $options: 'i' } });
                    query.$or.push({ description: { $regex: term, $options: 'i' } });
                    query.$or.push({ category: { $regex: term, $options: 'i' } });
                });
                const products = await Product.find(query).limit(5);
                if (products.length > 0) {
                    const list = products.map(p => `• ${p.name} - ₹${p.price.toFixed(2)}`).join('\n');
                    return { text: `I think you might be looking for:\n${list}\n\nDid I find what you wanted?`, products };
                }
            }
            return {
                text: "I'm not sure I understand. Here's what I can help with:\n\n• 🔍 **Search products** - Tell me what you're looking for\n• 💰 **Check prices** - Ask about product prices\n• 📦 **Stock availability** - Check if items are in stock\n• 📋 **Order status** - Track your orders\n• 🌟 **Recommendations** - Get product suggestions\n• 📂 **Categories** - Browse by category\n\nTry asking me something specific!",
                products: []
            };
        }
    }
}

// Generate OpenAI-powered response (optional)
async function generateAIResponse(message, userId) {
    if (!openai) {
        return generateRuleResponse(message, userId);
    }

    try {
        // Get context about available products
        const products = await Product.find().limit(20).select('name price category stock description');
        const productList = products.map(p => `${p.name} (₹${p.price}, ${p.category}, ${p.stock > 0 ? 'In Stock' : 'Out of Stock'})`).join('\n');

        let userContext = '';
        if (userId) {
            const orders = await Order.find({ customer: userId }).sort({ createdAt: -1 }).limit(5).select('status totalAmount');
            if (orders.length > 0) {
                userContext = `\nUser's recent orders: ${orders.map(o => `#${o._id.toString().slice(-6)} - ${o.status} - ₹${o.totalAmount}`).join(', ')}`;
            }
        }

        // Choose model based on provider
        const model = aiProvider === 'openrouter'
            ? (process.env.AI_MODEL || 'openrouter/free')  // Free model by default on OpenRouter
            : 'gpt-3.5-turbo';

        const response = await openai.chat.completions.create({
            model,
            messages: [
                {
                    role: "system",
                    content: `You are a helpful customer support chatbot for an online marketplace. Be friendly, concise, and helpful. You can help with product searches, order inquiries, and general questions. Here are the available products:\n${productList}${userContext}\n\nAlways respond in a helpful, professional manner. Use emojis to make responses friendly. Keep responses under 200 words.`
                },
                { role: "user", content: message }
            ],
            max_tokens: 300,
            temperature: 0.7
        });

        const content = response?.choices?.[0]?.message?.content?.trim();

        // Free/slow models sometimes return empty content. Fall back to the
        // rule-based path, which always has text and can attach product cards.
        if (!content) {
            return generateRuleResponse(message, userId);
        }

        // Pair the AI's prose with relevant product cards from the rule-based
        // path so answers like "trending products" still render clickable items.
        const rule = await generateRuleResponse(message, userId);
        return { text: content, products: rule.products };
    } catch (error) {
        console.error('AI provider error:', error.message);
        return generateRuleResponse(message, userId);
    }
}

// Main chatbot handler
exports.handleMessage = async (message, userId = null) => {
    if (!message || message.trim().length === 0) {
        return { text: "Please type a message and I'll do my best to help!", products: [] };
    }

    // Use OpenAI if configured, otherwise rule-based
    if (openai) {
        return generateAIResponse(message.trim(), userId);
    }
    return generateRuleResponse(message.trim(), userId);
};

exports.isAIEnabled = () => !!openai;
exports.getProvider = () => aiProvider;
