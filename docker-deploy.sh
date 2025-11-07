#!/bin/bash

# Docker deployment script for Phone Repair Shop Management System

echo "Building and deploying Phone Repair Shop Management System with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Warning: .env.local file not found!"
    echo "Please create .env.local with your environment variables."
    echo "You can copy .env.example to .env.local and update the values."
    read -p "Do you want to continue without environment variables? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        echo "Please create .env.local and try again."
        exit 1
    fi
fi

# Build and start services
echo "Building Docker images..."
docker-compose build

echo "Starting services..."
docker-compose up -d

echo "Deployment complete!"
echo "Access your application at http://localhost:3000"
echo "View logs with: docker-compose logs -f"