# ASHA Healthcare API

Backend service for an AI healthcare agent built with Express.js, Node.js, and TypeScript.

## Features

- Express.js server with TypeScript
- MongoDB integration with Mongoose
- Authentication middleware
- Error handling utilities
- Environment configuration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd asha-transcribing-service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/asha-health
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── config/         # Configuration files
├── middleware/     # Express middleware
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## API Endpoints

- `GET /`: Root endpoint, returns a welcome message

## License

ISC 