import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { TEMPLATES, PACKAGE_MANAGERS, Template, PackageManager, ProjectConfig } from '../types';
import { validateProjectName, downloadTemplate } from '../utils/download';
import { watchProjectAndOpenStudio } from '../utils/server';
import { 
  logError, 
  logSuccess, 
  logInfo, 
  logStep,
  displaySuccessBox 
} from '../utils/logger';

export async function createCommand(projectName: string): Promise<void> {
  try {
    console.log('\n');
    logInfo(`Creating new URPC project: ${projectName}`);
    
    // Check if directory already exists
    const targetDir = path.resolve(process.cwd(), projectName);
    const dirExists = await fs.pathExists(targetDir);
    
    let finalProjectName = projectName;
    let finalTargetDir = targetDir;
    let shouldDownloadTemplate = true;
    
    if (dirExists) {
      const action = await handleExistingDirectory(projectName);
      
      if (action === 'use_existing') {
        shouldDownloadTemplate = false;
        logInfo(`Using existing directory: ${projectName}`);
      } else if (action === 'create_new') {
        const newName = await askForNewProjectName(projectName);
        if (!newName) {
          return;
        }
        finalProjectName = newName;
        finalTargetDir = path.resolve(process.cwd(), newName);
      } else {
        logInfo('Operation cancelled');
        return;
      }
    } else {
      // Validate project name for new projects
      const isValidName = await validateProjectName(projectName);
      if (!isValidName) {
        return;
      }
    }
    
    // Let user select template
    const template = await selectTemplate();
    if (!template) {
      logError('No template selected');
      return;
    }
    
    // Let user select package manager
    const packageManager = await selectPackageManager();
    if (!packageManager) {
      logError('No package manager selected');
      return;
    }
    
    // Setup project configuration
    const config: ProjectConfig = {
      name: finalProjectName,
      template,
      packageManager,
      targetDir: finalTargetDir
    };
    
    // Download template from GitHub only if needed
    if (shouldDownloadTemplate) {
      const downloadSuccess = await downloadTemplate(
        template,
        config.targetDir,
        finalProjectName
      );
      
      if (!downloadSuccess) {
        logError('Failed to download template');
        return;
      }
      
      logStep(4, 4, 'Project setup complete!');
      
      // Display success message
      displaySuccessBox(
        finalProjectName,
        template.displayName,
        template.defaultPort
      );
    }
    
    // Ask if user wants to start the project
    const shouldStart = await askToStartProject();
    
    if (shouldStart) {
      logInfo('Starting project setup...');
      await watchProjectAndOpenStudio(config.targetDir, template, packageManager);
    } else {
      logInfo('Project ready!');
      logInfo(`To start your project:\n`);
      logInfo(`  cd ${finalProjectName}`);
      logInfo(`  ${packageManager.installCommand}`);
      logInfo(`  ${packageManager.runCommand} ${template.startScript}`);
    }
    
  } catch (error) {
    logError(`Failed to create project: ${error}`);
  }
}

async function selectTemplate(): Promise<Template | null> {
  try {
    const choices = TEMPLATES.map(template => ({
      name: `${template.displayName} - ${template.description}`,
      value: template,
      short: template.displayName
    }));
    
    const { selectedTemplate } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTemplate',
        message: '🎨 Select a template:',
        choices,
        pageSize: 10
      }
    ]);
    
    return selectedTemplate;
  } catch (error) {
    logError(`Failed to select template: ${error}`);
    return null;
  }
}

async function selectPackageManager(): Promise<PackageManager | null> {
  try {
    const choices = PACKAGE_MANAGERS.map(pm => ({
      name: `${pm.displayName} - ${pm.installCommand}`,
      value: pm,
      short: pm.displayName
    }));
    
    const { selectedPackageManager } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedPackageManager',
        message: '📦 Select a package manager:',
        choices,
        default: 0 // Default to npm
      }
    ]);
    
    return selectedPackageManager;
  } catch (error) {
    logError(`Failed to select package manager: ${error}`);
    return null;
  }
}

async function askToStartProject(): Promise<boolean> {
  try {
    const { shouldStart } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldStart',
        message: '🚀 Would you like to install dependencies and start the development server?',
        default: true
      }
    ]);
    
    return shouldStart;
  } catch (error) {
    logError(`Failed to get user input: ${error}`);
    return false;
  }
}

async function handleExistingDirectory(projectName: string): Promise<'use_existing' | 'create_new' | 'cancel'> {
  try {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `📁 Directory "${projectName}" already exists. What would you like to do?`,
        choices: [
          {
            name: '🚀 Use existing directory and start development server',
            value: 'use_existing',
            short: 'Use existing'
          },
          {
            name: '📝 Create new directory with different name',
            value: 'create_new',
            short: 'Create new'
          },
          {
            name: '❌ Cancel',
            value: 'cancel',
            short: 'Cancel'
          }
        ],
        default: 0
      }
    ]);
    
    return action;
  } catch (error) {
    logError(`Failed to get user input: ${error}`);
    return 'cancel';
  }
}

async function askForNewProjectName(originalName: string): Promise<string | null> {
  try {
    const { newName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'newName',
        message: '📝 Enter a new project name:',
        default: `${originalName}-new`,
        validate: async (input: string) => {
          if (!input || input.length === 0) {
            return 'Project name cannot be empty';
          }
          
          // Check for invalid characters
          const invalidChars = /[^a-zA-Z0-9-_]/;
          if (invalidChars.test(input)) {
            return 'Project name can only contain letters, numbers, hyphens, and underscores';
          }
          
          // Check if directory already exists
          if (await fs.pathExists(input)) {
            return `Directory ${input} already exists`;
          }
          
          return true;
        }
      }
    ]);
    
    return newName;
  } catch (error) {
    logError(`Failed to get user input: ${error}`);
    return null;
  }
} 