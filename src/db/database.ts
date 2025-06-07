import mongoose from 'mongoose';
import config from './database.config';

const connectDB = async (): Promise<void> => {
  try {
    console.log(`Connecting to MongoDB: ${config.mongoUri}`);
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

export default connectDB; 