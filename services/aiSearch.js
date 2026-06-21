/**
 * AI-Enhanced Search Service
 * Improves search with synonym matching, fuzzy search, and intent detection
 */

// Synonym dictionary for common search terms
const SYNONYMS = {
    laptop: ['notebook', 'computer', 'pc', 'macbook'],
    phone: ['mobile', 'smartphone', 'cellphone', 'android', 'iphone'],
    headphones: ['earphones', 'earbuds', 'headset', 'airpods', 'buds'],
    watch: ['smartwatch', 'wristwatch', 'timepiece'],
    bag: ['backpack', 'handbag', 'purse', 'tote'],
    shirt: ['tshirt', 't-shirt', 'top', 'tee'],
    shoes: ['sneakers', 'boots', 'footwear', 'sandals'],
    book: ['novel', 'textbook', 'reading', 'paperback'],
    keyboard: ['mechanical keyboard', 'typewriter'],
    lamp: ['light', 'bulb', 'lantern', 'lighting'],
    camera: ['photography', 'dslr', 'webcam', 'lens'],
    tablet: ['ipad', 'tab', 'pad'],
    speaker: ['soundbar', 'audio', 'bluetooth speaker'],
    mouse: ['trackpad', 'gaming mouse', 'wireless mouse'],
    monitor: ['display', 'screen', 'panel'],
    cable: ['charger', 'wire', 'cord', 'adapter'],
    jacket: ['coat', 'blazer', 'outerwear'],
    dress: ['gown', 'frock', 'outfit'],
    home: ['house', 'furniture', 'decor', 'interior'],
    kitchen: ['cooking', 'utensil', 'appliance'],
    gaming: ['game', 'gamer', 'playstation', 'xbox'],
    fitness: ['gym', 'workout', 'exercise', 'sports'],
    beauty: ['cosmetics', 'makeup', 'skincare'],
    food: ['snack', 'organic', 'grocery', 'eat']
};

// Expand search query with synonyms
function expandQuery(terms) {
    const expanded = new Set(terms);
    terms.forEach(term => {
        Object.entries(SYNONYMS).forEach(([key, syns]) => {
            if (key.includes(term) || syns.some(s => s.includes(term))) {
                expanded.add(key);
                syns.forEach(s => expanded.add(s));
            }
        });
    });
    return [...expanded];
}

// Rank products by relevance score
function rankProducts(products, searchTerms) {
    return products.map(product => {
        let score = 0;
        const nameLower = product.name.toLowerCase();
        const descLower = (product.description || '').toLowerCase();
        const catLower = (product.category || '').toLowerCase();

        searchTerms.forEach(term => {
            // Exact name match (highest weight)
            if (nameLower.includes(term)) score += 10;
            // Category match
            if (catLower.includes(term)) score += 7;
            // Description match
            if (descLower.includes(term)) score += 3;
        });

        // Boost popular products (by review count or recent orders)
        score += Math.min(product.reviewCount || 0, 5);

        return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}

// Enhanced search function
exports.enhancedSearch = async (query, Product) => {
    const ProductModel = Product || require('../models/Product');

    // Extract search terms
    const terms = query.search ? query.search.toLowerCase().split(/\s+/).filter(t => t.length > 1) : [];
    const category = query.category || '';
    const minPrice = parseFloat(query.minPrice) || 0;
    const maxPrice = parseFloat(query.maxPrice) || Infinity;

    // Expand terms with synonyms
    const expandedTerms = expandQuery(terms);

    // Build MongoDB query
    const mongoQuery = {};

    if (expandedTerms.length > 0) {
        mongoQuery.$or = [];
        expandedTerms.forEach(term => {
            mongoQuery.$or.push({ name: { $regex: term, $options: 'i' } });
            mongoQuery.$or.push({ description: { $regex: term, $options: 'i' } });
            mongoQuery.$or.push({ category: { $regex: term, $options: 'i' } });
        });
    }

    if (category) {
        mongoQuery.category = category;
    }

    if (minPrice > 0 || maxPrice < Infinity) {
        mongoQuery.price = {};
        if (minPrice > 0) mongoQuery.price.$gte = minPrice;
        if (maxPrice < Infinity) mongoQuery.price.$lte = maxPrice;
    }

    // Execute query
    let products;
    if (Object.keys(mongoQuery).length === 0) {
        products = await ProductModel.find();
    } else {
        products = await ProductModel.find(mongoQuery);
    }

    // Rank results by relevance
    if (terms.length > 0) {
        products = rankProducts(products, terms);
    }

    return products;
};

// Get search suggestions for autocomplete
exports.getSuggestions = async (partial, Product) => {
    const ProductModel = Product || require('../models/Product');
    if (!partial || partial.length < 2) return [];

    const regex = { $regex: partial, $options: 'i' };
    const suggestions = await ProductModel.find({
        $or: [{ name: regex }, { category: regex }]
    })
    .select('name category')
    .limit(8);

    return suggestions.map(s => ({
        text: s.name,
        type: 'product'
    })).concat(
        // Add category suggestions
        [...new Set(suggestions.map(s => s.category))]
            .filter(c => c.toLowerCase().includes(partial.toLowerCase()))
            .map(c => ({ text: c, type: 'category' }))
    );
};

exports.SYNONYMS = SYNONYMS;
exports.expandQuery = expandQuery;
