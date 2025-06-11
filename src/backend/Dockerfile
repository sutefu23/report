FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../shared/package*.json ../shared/

# Install dependencies
RUN npm install

# Copy source code
COPY . .
COPY ../shared ../shared

# Build
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]