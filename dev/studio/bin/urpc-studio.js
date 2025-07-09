#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory where this package is installed
const packageDir = path.dirname(__dirname);

console.log('🚀 Starting Unify Studio...');
console.log('📍 Package directory:', packageDir);

// Check if we're running in development (from examples/studio) or as installed package
const isDevMode = fs.existsSync(path.join(packageDir, 'examples'));
const studioDir = isDevMode ? packageDir : packageDir;

console.log('📍 Studio directory:', studioDir);
console.log('🔧 Running in:', isDevMode ? 'development mode' : 'production mode');

// Check if required files exist
const requiredFiles = ['index.html', 'src', 'vite.config.ts'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(studioDir, file)));

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:', missingFiles.join(', '));
  console.error('Please ensure unify-studio is properly installed.');
  process.exit(1);
}

function startStudio() {
  console.log('🎨 Launching Unify Studio...');
  console.log('🌐 Studio will be available at: http://localhost:3001');
  console.log('📊 Make sure your Unify server is running on: http://localhost:3000');
  console.log('\n' + '='.repeat(50));
  
  // Run vite dev in the studio directory
  const studioProcess = spawn('npx', ['vite'], {
    cwd: studioDir,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Unify Studio...');
    studioProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down Unify Studio...');
    studioProcess.kill('SIGTERM');
    process.exit(0);
  });

  studioProcess.on('close', (code) => {
    console.log(`\n📴 Studio process exited with code ${code}`);
    process.exit(code);
  });

  studioProcess.on('error', (error) => {
    console.error('❌ Failed to start Studio:', error.message);
    console.error('Please make sure vite is available in your system.');
    process.exit(1);
  });
}

// Start studio
startStudio(); 