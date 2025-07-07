#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory where this package is installed
const packageDir = path.dirname(__dirname);
const studioDir = path.join(packageDir, 'studio');

console.log('🚀 Starting Unify Studio...');
console.log('📍 Package directory:', packageDir);
console.log('📍 Studio directory:', studioDir);

// Check if studio directory exists
if (!fs.existsSync(studioDir)) {
  console.error('❌ Studio directory not found. Please ensure @unify/client is properly installed.');
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
    shell: true
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
}

// Start studio directly since dependencies are in parent package
startStudio(); 