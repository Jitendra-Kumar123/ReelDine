const mongoose = require('mongoose');

function connectDB() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ReelDine';
    mongoose.connect(mongoUri)
        .then(() => {
            console.log("connected to MongoDB");
        })
        .catch((err) => {
            console.log("MongoDB connection error:", err);
        })
}

module.exports = connectDB;
