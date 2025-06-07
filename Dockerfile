FROM node:18-alpine

# Create app directory and user
WORKDIR /app
RUN adduser -D nodeuser

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Set ownership to nodeuser
RUN chown -R nodeuser /app

# Switch to non-root user
USER nodeuser

EXPOSE 8000
CMD ["npm", "start"] 