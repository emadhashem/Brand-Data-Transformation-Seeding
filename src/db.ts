import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("MONGODB_URI is not defined in the .env file");
    process.exit(1); // Exit if the connection string is missing
  }

  try {
    // Attempt to connect to the database
    await mongoose.connect(mongoURI);
  } catch (err: any) {
    // Handle initial connection errors
    console.error("Failed to connect to MongoDB on startup:", err.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
  } catch (err: any) {
    console.error("Failed to disconnect from MongoDB:", err.message);
  }
};

export { connectDB, disconnectDB };
