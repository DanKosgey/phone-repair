#!/usr/bin/env node

// Render build script for Jay's Phone Repair app
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Render build process...');

// Function to execute command with error handling
function execCommand(command) {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`, error.message);
    return false;
  }
}

try {
  // Clean any existing build artifacts
  console.log('Cleaning build artifacts...');
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('Cleaned .next directory');
  }

  // Handle lockfile issues - remove bun.lockb to avoid conflicts
  if (fs.existsSync('bun.lockb')) {
    console.log('Found bun.lockb file, removing to avoid compatibility issues...');
    fs.unlinkSync('bun.lockb');
  }

  // Install dependencies using npm ci for clean installs
  console.log('Installing dependencies...');
  if (!execCommand('npm ci --only=production')) {
    console.log('npm ci failed, trying npm install...');
    if (!execCommand('npm install --only=production')) {
      throw new Error('Failed to install dependencies');
    }
  }

  // Build the application
  console.log('Building the application...');
  if (!execCommand('npm run build')) {
    throw new Error('Failed to build the application');
  }

  console.log('Build process completed successfully!');
} catch (error) {
  console.error('Build process failed:', error.message);
  process.exit(1);
}