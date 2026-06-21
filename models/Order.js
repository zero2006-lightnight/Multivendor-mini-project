
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpaySignature: { type: String },
    couponCode: { type: String },
    discount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);


