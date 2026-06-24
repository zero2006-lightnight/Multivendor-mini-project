const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let admin = await User.findOne({ email: 'admin@market.com' });
    if (!admin) {
        admin = await User.create({ username: 'admin', email: 'admin@market.com', password: 'admin123', role: 'admin', shopName: 'Marketplace Admin' });
        console.log('Admin created');
    }

    let vendor = await User.findOne({ email: 'vendor@market.com' });
    if (!vendor) {
        vendor = await User.create({ username: 'vendor1', email: 'vendor@market.com', password: 'vendor123', role: 'vendor', shopName: 'Tech Haven' });
        console.log('Vendor created');
    }

    let customer = await User.findOne({ email: 'customer@market.com' });
    if (!customer) {
        customer = await User.create({ username: 'customer1', email: 'customer@market.com', password: 'customer123', role: 'customer' });
        console.log('Customer created');
    }

    const products = [
        { name: 'Wireless Bluetooth Headphones', description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.', price: 79.99, category: 'Electronics', stock: 25, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', vendor: vendor._id },
        { name: 'Organic Green Tea Set', description: 'Premium Japanese green tea collection with ceramic teapot.', price: 45.99, category: 'Food & Beverages', stock: 15, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', vendor: vendor._id },
        { name: 'Handmade Leather Journal', description: 'Genuine leather bound journal with 200 pages.', price: 34.99, category: 'Stationery', stock: 30, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', vendor: vendor._id },
        { name: 'Smart Fitness Watch', description: 'Advanced fitness tracker with heart rate monitor and GPS.', price: 129.99, category: 'Electronics', stock: 20, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', vendor: vendor._id },
        { name: 'Artisan Ceramic Mug Set', description: 'Set of 4 handcrafted ceramic mugs.', price: 39.99, category: 'Home & Kitchen', stock: 18, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500', vendor: vendor._id },
        { name: 'Bamboo Cutting Board', description: 'Eco-friendly bamboo cutting board with juice groove.', price: 24.99, category: 'Home & Kitchen', stock: 40, image: 'https://images.unsplash.com/photo-1588167862229-32aa9e37a7c6?w=500', vendor: vendor._id },
        { name: 'Plant-Based Protein Powder', description: 'Organic vegan protein powder with 25g protein per serving.', price: 34.99, category: 'Food & Beverages', stock: 50, image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500', vendor: vendor._id },
        { name: 'Portable Phone Charger', description: 'Compact 10000mAh portable charger with fast charging.', price: 29.99, category: 'Electronics', stock: 35, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500', vendor: vendor._id },
        { name: 'Yoga Mat Premium', description: 'Extra thick non-slip yoga mat. Eco-friendly materials.', price: 49.99, category: 'Sports & Fitness', stock: 22, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', vendor: vendor._id },
        { name: 'Minimalist Desk Lamp', description: 'Modern LED desk lamp with adjustable brightness.', price: 42.99, category: 'Home & Kitchen', stock: 15, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab788?w=500', vendor: vendor._id },
        { name: 'Organic Cotton T-Shirt', description: 'Soft organic cotton t-shirt. Sustainable fashion.', price: 28.99, category: 'Fashion', stock: 60, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', vendor: vendor._id },
        { name: 'Stainless Steel Water Bottle', description: 'Double-wall insulated water bottle.', price: 19.99, category: 'Sports & Fitness', stock: 45, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', vendor: vendor._id }
    ];

    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(products.length + ' products seeded');
    console.log('Admin: admin@market.com / admin123');
    console.log('Vendor: vendor@market.com / vendor123');
    console.log('Customer: customer@market.com / customer123');
    process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
