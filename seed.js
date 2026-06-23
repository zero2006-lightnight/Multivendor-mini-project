const mongoose = require('mongoose');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http');
const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

// Fetch JSON from a URL (works in Node.js without external deps)
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Failed to parse JSON: ' + e.message));
                }
            });
        }).on('error', reject);
    });
}

// USD to INR conversion (approximate)
const USD_TO_INR = 83;

// Capitalize category names (e.g. "smartphones" -> "Smartphones")
function capitalizeCategory(cat) {
    if (!cat) return 'General';
    return cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Fallback products if API is unavailable
async function seedFallbackProducts(vendor) {
    const fallback = [
        { name: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones', price: 2999, category: 'Electronics', stock: 15, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', vendor: vendor._id },
        { name: 'Smart Watch', description: 'Feature-rich smartwatch with heart rate monitor', price: 4999, category: 'Electronics', stock: 8, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', vendor: vendor._id },
        { name: 'Laptop Backpack', description: 'Waterproof laptop backpack with USB charging port', price: 1499, category: 'Accessories', stock: 20, image: 'https://picsum.photos/500/300?random=1', vendor: vendor._id },
        { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with blue switches', price: 3499, category: 'Electronics', stock: 12, image: 'https://picsum.photos/500/300?random=2', vendor: vendor._id },
        { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness', price: 899, category: 'Home', stock: 25, image: 'https://picsum.photos/500/300?random=3', vendor: vendor._id },
    ];
    await Product.create(fallback);
    console.log('5 fallback products created');
}

async function seed() {
    try {
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            await User.create({ username: 'admin', email: 'admin@test.com', password: 'admin123', role: 'admin' });
            console.log('Admin Created: admin@test.com / admin123');
        }

        let vendor = await User.findOne({ role: 'vendor' });
        if (!vendor) {
            vendor = await User.create({ username: 'vendor1', email: 'vendor@test.com', password: 'password123', role: 'vendor', shopName: 'Demo Shop' });
            console.log('Vendor Created: vendor@test.com / password123');
        }

        let customer = await User.findOne({ username: 'customer1' });
        if (!customer) {
            await User.create({ username: 'customer1', email: 'customer@test.com', password: 'password123', role: 'customer' });
            console.log('Customer Created: customer@test.com / password123');
        }

        const existingProducts = await Product.countDocuments();
        if (existingProducts === 0 && vendor) {
            console.log('Fetching products from DummyJSON API...');

            try {
                const data = await fetchJSON('https://dummyjson.com/products?limit=200');
                const apiProducts = data.products || [];
                console.log('Fetched ' + apiProducts.length + ' products from API');

                const products = apiProducts.map((p) => ({
                    name: p.title,
                    description: p.description || ((p.brand ? p.brand + ' ' : '') + p.title),
                    price: Math.round(p.price * USD_TO_INR),
                    category: capitalizeCategory(p.category),
                    stock: p.stock || 0,
                    image: p.thumbnail || (p.images && p.images[0]) || '',
                    vendor: vendor._id,
                }));

                const batchSize = 50;
                for (let i = 0; i < products.length; i += batchSize) {
                    const batch = products.slice(i, i + batchSize);
                    await Product.insertMany(batch);
                    console.log('  Inserted batch ' + (Math.floor(i / batchSize) + 1) + ' (' + batch.length + ' products)');
                }

                console.log('\n' + products.length + ' Products Created from DummyJSON API');

                const categories = {};
                products.forEach(p => {
                    categories[p.category] = (categories[p.category] || 0) + 1;
                });
                console.log('\nCategory breakdown:');
                Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
                    console.log('  ' + cat + ': ' + count);
                });

            } catch (apiError) {
                console.error('Failed to fetch from DummyJSON API:', apiError.message);
                console.log('Falling back to seed with sample products...');
                await seedFallbackProducts(vendor);
            }
        } else if (existingProducts > 0) {
            console.log(existingProducts + ' products already exist, skipping product seed.');
        }

        const existingCoupons = await Coupon.countDocuments();
        if (existingCoupons === 0) {
            await Coupon.create([
                { code: 'WELCOME10', discount: 10, expiryDate: new Date('2027-12-31') },
                { code: 'SAVE20', discount: 20, expiryDate: new Date('2027-12-31') }
            ]);
            console.log('2 Coupons Created (WELCOME10, SAVE20)');
        }

        console.log('\nSeed Complete! Accounts:');
        console.log('  Admin:    admin@test.com / admin123');
        console.log('  Vendor:   vendor@test.com / password123');
        console.log('  Customer: customer@test.com / password123');
        process.exit();
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

seed();
