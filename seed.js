const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

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
            await Product.create([
                { name: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones', price: 2999, category: 'Electronics', stock: 15, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', vendor: vendor._id },
                { name: 'Smart Watch', description: 'Feature-rich smartwatch with heart rate monitor', price: 4999, category: 'Electronics', stock: 8, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', vendor: vendor._id },
                { name: 'Laptop Backpack', description: 'Waterproof laptop backpack with USB charging port', price: 1499, category: 'Accessories', stock: 20, imageUrl: 'https://picsum.photos/500/300?random=1', vendor: vendor._id },
                { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with blue switches', price: 3499, category: 'Electronics', stock: 12, imageUrl: 'https://picsum.photos/500/300?random=2', vendor: vendor._id },
                { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness', price: 899, category: 'Home', stock: 25, imageUrl: 'https://picsum.photos/500/300?random=3', vendor: vendor._id }
            ]);
            console.log('5 Products Created');
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
        console.error(err);
        process.exit(1);
    }
}

seed();