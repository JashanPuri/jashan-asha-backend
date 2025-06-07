# ASHA Healthcare API

A real-time transcription and healthcare service built with Express.js, WebSocket, and TypeScript.

## Core Features

- Real-time audio transcription using AssemblyAI
- WebSocket-based communication for streaming audio
- BullMQ for background job processing
- MongoDB integration
- Notification system

## Prerequisites

- Docker and Docker Compose
- AssemblyAI API Key
- OpenAI API Key

## Setup

### Using Docker Compose

1. Create a `.env` file:
```bash
ASSEMBLYAI_API_KEY=your-assemblyai-api-key
OPENAI_API_KEY=your-openai-api-key
```

2. Start the services:
```bash
# Build
docker-compose build

# Start all services in the background
docker-compose up -d

# Stop all services
docker-compose down
```

This will start main application at: http://localhost:8000


### Local Development

For local development without Docker:

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```bash
ASSEMBLYAI_API_KEY=your-assemblyai-api-key
OPENAI_API_KEY=your-openai-api-key
MONGODB_URI=mongodb://localhost:27017/asha-health
REDIS_URL=redis://localhost:6379
```

3. Start the application:
```bash
npm run dev
```

## API Endpoints

- `GET /`: Health check endpoint
- `GET /ping`: Server status endpoint
- `WS /transcribe`: WebSocket endpoint for real-time transcription
- `WS /notifications`: WebSocket endpoint for real-time notifications
- `API /api/v1/*`: REST API endpoints

## License

ISC 