const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Coupon = require('./models/Coupon');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);


async function seedCoupons() {

    await Coupon.deleteMany();

    await Coupon.create([
        {
            code: 'WELCOME10',
            discount: 10,
            expiryDate: new Date('2027-12-31')
        },
        {
            code: 'SAVE20',
            discount: 20,
            expiryDate: new Date('2027-12-31')
        }
    ]);

    console.log('Coupons Added');
    process.exit();
}

seedCoupons();