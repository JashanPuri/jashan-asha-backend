import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/asha-health'
};

export default config; 