import { spawn } from 'cross-spawn';
import fs from 'fs-extra';
import path from 'path';
import { Template } from '../types';
import { logError, logInfo, logStep } from './logger';

export async function downloadTemplate(
  template: Template,
  targetDir: string,
  projectName: string
): Promise<boolean> {
  try {
    logStep(1, 4, `Downloading ${template.displayName} template...`);
    
    // Create parent directory if it doesn't exist
    const parentDir = path.dirname(targetDir);
    await fs.ensureDir(parentDir);
    
    // Use git clone to download from GitHub
    const gitUrl = `https://github.com/${template.githubPath}.git`;
    const tempDir = `${targetDir}-temp`;
    
    // Clone the repository
    const cloneResult = await executeCommand('git', ['clone', gitUrl, tempDir]);
    if (!cloneResult) {
      return false;
    }
    
    // Copy the specific template directory
    const templateSource = path.join(tempDir, 'examples', template.name);
    
    if (await fs.pathExists(templateSource)) {
      await fs.copy(templateSource, targetDir);
    } else {
      logError(`Template directory not found: ${templateSource}`);
      return false;
    }
    
    // Clean up temporary directory
    await fs.remove(tempDir);
    
    logStep(2, 4, 'Template downloaded successfully!');
    
    // Update package.json with project name
    await updatePackageJson(targetDir, projectName);
    
    logStep(3, 4, 'Project configuration updated!');
    
    return true;
  } catch (error) {
    logError(`Failed to download template: ${error}`);
    return false;
  }
}

async function executeCommand(command: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      windowsVerbatimArguments: false
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        logError(`Command failed with exit code: ${code}`);
        resolve(false);
      }
    });
    
    process.on('error', (error) => {
      logError(`Command error: ${error.message}`);
      resolve(false);
    });
  });
}

async function updatePackageJson(targetDir: string, projectName: string): Promise<void> {
  try {
    const packageJsonPath = path.join(targetDir, 'package.json');
    
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = projectName;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      logInfo(`Updated package.json with project name: ${projectName}`);
    }
  } catch (error) {
    logError(`Failed to update package.json: ${error}`);
  }
}

export async function validateProjectName(name: string): Promise<boolean> {
  // Check if name is valid
  if (!name || name.length === 0) {
    logError('Project name cannot be empty');
    return false;
  }
  
  // Check for invalid characters
  const invalidChars = /[^a-zA-Z0-9-_]/;
  if (invalidChars.test(name)) {
    logError('Project name can only contain letters, numbers, hyphens, and underscores');
    return false;
  }
  
  // Check if directory already exists
  if (await fs.pathExists(name)) {
    logError(`Directory ${name} already exists`);
    return false;
  }
  
  return true;
} 