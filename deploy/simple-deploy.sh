#!/bin/bash

# Simple deployment script for mock application

echo "🚀 Simple AWS Deployment Options"
echo "================================"
echo ""
echo "Option 1: AWS Amplify (Recommended for mock)"
echo "--------------------------------------------"
echo "1. Go to AWS Amplify Console"
echo "2. Connect your GitHub repo"
echo "3. Use the amplify.yml config"
echo "4. Deploy!"
echo ""
echo "Option 2: Single EC2 Instance"
echo "-----------------------------"
echo "1. Launch t2.micro EC2 instance"
echo "2. Install Docker"
echo "3. Run: docker-compose up -d"
echo ""
echo "Option 3: Local Docker + ngrok"
echo "------------------------------"
echo "1. Run locally: docker-compose up"
echo "2. Expose with ngrok: ngrok http 3000"
echo "3. Share the ngrok URL"
echo ""

# Docker Compose for production
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: daily_report
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./src/backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/daily_report
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    depends_on:
      - postgres
    ports:
      - "3001:3001"

  frontend:
    build: ./src/front
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3001
    depends_on:
      - backend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
EOF

echo "✅ Created docker-compose.prod.yml"