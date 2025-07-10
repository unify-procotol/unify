import inquirer from 'inquirer';
import path from 'path';
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
    
    // Validate project name
    const isValidName = await validateProjectName(projectName);
    if (!isValidName) {
      return;
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
      name: projectName,
      template,
      packageManager,
      targetDir: path.resolve(process.cwd(), projectName)
    };
    
    // Download template from GitHub
    const downloadSuccess = await downloadTemplate(
      template,
      config.targetDir,
      projectName
    );
    
    if (!downloadSuccess) {
      logError('Failed to download template');
      return;
    }
    
    logStep(4, 4, 'Project setup complete!');
    
    // Display success message
    displaySuccessBox(
      projectName,
      template.displayName,
      template.defaultPort
    );
    
    // Ask if user wants to start the project
    const shouldStart = await askToStartProject();
    
    if (shouldStart) {
      logInfo('Starting project setup...');
      await watchProjectAndOpenStudio(config.targetDir, template, packageManager);
    } else {
      logInfo('Project created successfully!');
      logInfo(`To start your project:\n`);
      logInfo(`  cd ${projectName}`);
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