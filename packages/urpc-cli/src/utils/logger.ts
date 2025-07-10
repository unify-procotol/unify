import chalk from 'chalk';
import boxen from 'boxen';
import figlet from 'figlet';
import gradient from 'gradient-string';

export function displayBanner() {
  const banner = figlet.textSync('URPC CLI', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });
  
  console.log(gradient.rainbow(banner));
  console.log(
    boxen(
      `${chalk.bold('Welcome to URPC CLI!')} 🚀\n\n` +
      `${chalk.dim('Create amazing URPC projects in seconds')}\n` +
      `${chalk.dim('Visit:')} ${chalk.cyan('https://urpc.io')}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        backgroundColor: '#1a1a1a'
      }
    )
  );
}

export function logSuccess(message: string) {
  console.log(chalk.green(`✅ ${message}`));
}

export function logError(message: string) {
  console.log(chalk.red(`❌ ${message}`));
}

export function logWarning(message: string) {
  console.log(chalk.yellow(`⚠️  ${message}`));
}

export function logInfo(message: string) {
  console.log(chalk.blue(`ℹ️  ${message}`));
}

export function logStep(step: number, total: number, message: string) {
  console.log(chalk.cyan(`[${step}/${total}] ${message}`));
}

export function displaySuccessBox(projectName: string, template: string, port: number) {
  const successMessage = 
    `${chalk.green.bold('🎉 Project created successfully!')}\n\n` +
    `${chalk.bold('Project:')} ${chalk.cyan(projectName)}\n` +
    `${chalk.bold('Template:')} ${chalk.magenta(template)}\n` +
    `${chalk.bold('Port:')} ${chalk.yellow(port)}\n\n` +
    `${chalk.dim('Next steps:')}\n` +
    `${chalk.dim('1. cd')} ${chalk.cyan(projectName)}\n` +
    `${chalk.dim('2. npm install')}\n` +
    `${chalk.dim('3. npm run dev')}\n\n` +
    `${chalk.bold('Studio will open automatically! 🎨')}`;

  console.log(
    boxen(successMessage, {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'green',
      backgroundColor: '#0a0a0a'
    })
  );
}

export function displayStudioMessage(studioUrl: string) {
  const studioMessage = 
    `${chalk.bold.magenta('🎨 URPC Studio is ready!')}\n\n` +
    `${chalk.bold('Studio URL:')} ${chalk.cyan(studioUrl)}\n\n` +
    `${chalk.dim('Opening in your browser...')}`;

  console.log(
    boxen(studioMessage, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'magenta',
      backgroundColor: '#1a0a1a'
    })
  );
} 