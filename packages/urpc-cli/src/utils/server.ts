import { spawn } from 'cross-spawn';
import detectPort from 'detect-port';
import open from 'open';
import fs from 'fs-extra';
import path from 'path';
import { Template, PackageManager, STUDIO_URL, getPlatformCommand } from '../types';
import { logInfo, logSuccess, logError, displayStudioMessage } from './logger';
import { repo, URPC } from '@unilab/urpc';

export async function installDependencies(
  targetDir: string,
  packageManager: PackageManager
): Promise<boolean> {
  try {
    logInfo(`Installing dependencies with ${packageManager.displayName}...`);
    
    // Parse the install command to get command and args
    const installCommandParts = packageManager.installCommand.split(' ');
    const command = getPlatformCommand(installCommandParts[0]);
    const args = installCommandParts.slice(1);
    
    const installProcess = spawn(command, args, {
      cwd: targetDir,
      stdio: 'inherit',
      shell: true,
      windowsVerbatimArguments: false
    });
    
    return new Promise((resolve) => {
      installProcess.on('close', (code) => {
        if (code === 0) {
          logSuccess('Dependencies installed successfully!');
          resolve(true);
        } else {
          logError(`Failed to install dependencies with ${packageManager.displayName}`);
          resolve(false);
        }
      });
      
      installProcess.on('error', (error) => {
        logError(`Installation error: ${error.message}`);
        resolve(false);
      });
    });
  } catch (error) {
    logError(`Failed to install dependencies: ${error}`);
    return false;
  }
}

export async function installDependenciesWithFallback(
  targetDir: string,
  packageManager: PackageManager
): Promise<boolean> {
  // Try the selected package manager first
  const success = await installDependencies(targetDir, packageManager);
  
  if (!success && packageManager.name !== 'npm') {
    logInfo('Falling back to npm...');
    const npmManager = {
      name: 'npm' as const,
      displayName: 'npm',
      installCommand: 'npm install',
      runCommand: 'npm run'
    };
    
    return await installDependencies(targetDir, npmManager);
  }
  
  return success;
}

export async function startDevServer(
  targetDir: string,
  template: Template,
  packageManager: PackageManager
): Promise<number | null> {
  try {
    // Check if port is available
    const port = await detectPort(template.defaultPort);
    
    if (port !== template.defaultPort) {
      logInfo(`Port ${template.defaultPort} is busy, using port ${port}`);
    }
    
    logInfo(`Starting development server on port ${port}...`);
    
    // Parse the run command to get command and args
    const runCommandParts = packageManager.runCommand.split(' ');
    const command = getPlatformCommand(runCommandParts[0]);
    const args = [...runCommandParts.slice(1), template.startScript];
    
    const devProcess = spawn(command, args, {
      cwd: targetDir,
      stdio: 'pipe',
      shell: true,
      windowsVerbatimArguments: false
    });
    
    // Monitor server startup
    return new Promise((resolve) => {
      let serverStarted = false;
      
      devProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        
        // Check if server is ready (different patterns for different frameworks)
        if (
          output.includes('ready') ||
          output.includes('Local:') ||
          output.includes('localhost') ||
          output.includes(`http://localhost:${port}`) ||
          output.includes('Server running') ||
          output.includes('🚀 Server running')
        ) {
          if (!serverStarted) {
            serverStarted = true;
            logSuccess(`Development server started on http://localhost:${port}`);
            resolve(port);
          }
        }
      });
      
      devProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        console.error(output);
      });
      
      devProcess.on('close', (code) => {
        if (code !== 0 && !serverStarted) {
          logError(`Development server failed to start (exit code: ${code})`);
          resolve(null);
        }
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!serverStarted) {
          logError('Server startup timeout');
          resolve(null);
        }
      }, 30000);
    });
  } catch (error) {
    logError(`Failed to start development server: ${error}`);
    return null;
  }
}

export async function openStudio(port: number): Promise<void> {
  try {
    // Wait a bit for server to fully start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if server is actually running
    const isRunning = await checkServerHealth(port);
    
    if (isRunning) {
      const studioUrl = `${STUDIO_URL}?endpoint=http://localhost:${port}`;
      
      displayStudioMessage(studioUrl);
      
      // Open the studio in default browser
      await open(studioUrl);
      
      logSuccess('Studio opened in your browser!');
    } else {
      logError('Server is not responding, cannot open Studio');
    }
  } catch (error) {
    logError(`Failed to open Studio: ${error}`);
  }
}

async function checkServerHealth(port: number): Promise<boolean> {
  try {
    URPC.init({
      baseUrl: `http://localhost:${port}`,
      timeout: 5000,
    });
    const allEntities = await repo({
      entity: "schema",
      source: "_global",
    }).findMany();
    return Array.isArray(allEntities);
  } catch (error) {
    console.log("checkServerHealth error", error);
    return false;
  }
}

export async function watchProjectAndOpenStudio(
  targetDir: string,
  template: Template,
  packageManager: PackageManager
): Promise<void> {
  try {
    // Install dependencies first with fallback
    const installSuccess = await installDependenciesWithFallback(targetDir, packageManager);
    
    if (!installSuccess) {
      logError('Failed to install dependencies with all package managers.');
      logInfo('Please install manually:');
      logInfo(`  cd ${path.basename(targetDir)}`);
      logInfo(`  npm install`);
      logInfo(`  npm run ${template.startScript}`);
      return;
    }
    
    // Start development server
    const port = await startDevServer(targetDir, template, packageManager);
    
    if (port) {
      // Open studio automatically
      await openStudio(port);
    } else {
      logError('Failed to start development server');
      logInfo('You can start it manually:');
      logInfo(`  cd ${path.basename(targetDir)}`);
      logInfo(`  ${packageManager.runCommand} ${template.startScript}`);
    }
  } catch (error) {
    logError(`Failed to setup project: ${error}`);
  }
} 