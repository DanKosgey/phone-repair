#!/bin/bash

# Render build script for Jay's Phone Repair app

echo "Starting Render build process..."

# Clean any existing build artifacts
echo "Cleaning build artifacts..."
rm -rf .next

# Handle lockfile issues
if [ -f "bun.lockb" ]; then
  echo "Found bun.lockb file, checking compatibility..."
  # If bun.lockb is incompatible, remove it to force fresh install
  echo "Removing incompatible lockfile to force fresh install..."
  rm bun.lockb
fi

# Install dependencies
echo "Installing dependencies..."
if command -v bun &> /dev/null; then
  echo "Using bun for installation..."
  bun install
else
  echo "Using npm for installation..."
  npm ci --only=production
fi

# Build the application
echo "Building the application..."
npm run build

echo "Build process completed!"