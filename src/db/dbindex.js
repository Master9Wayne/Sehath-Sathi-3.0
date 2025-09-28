import mongoose from "mongoose";

const connectDB = async function() {
    try {
        // The MONGODB_URI from your .env file should contain the database name.
        // We no longer append the DB_NAME here.
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error", error);
        process.exit(1);
    }
}

export default connectDB;