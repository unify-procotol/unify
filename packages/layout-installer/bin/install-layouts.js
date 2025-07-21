#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Get compiled file path
const installerPath = path.resolve(__dirname, '../dist/index.js');

try {
  // Execute installer
  require(installerPath);
} catch (error) {
  console.error('Failed to run layout installer:', error.message);
  process.exit(1);
} 