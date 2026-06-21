require('dotenv').config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB Connected');
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});