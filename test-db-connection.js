import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log("Testing MongoDB Connection...");
console.log("URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Successfully connected to MongoDB!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Connection Failed!");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        console.error("Full Error:", err);
        process.exit(1);
    });
