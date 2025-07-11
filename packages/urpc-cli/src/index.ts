#!/usr/bin/env node

import { program } from 'commander';
import { createCommand } from './commands/create.js';
import { displayBanner } from './utils/logger.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import packageJson from '../package.json';

async function main() {
  displayBanner();
  
  program
    .name('urpc-cli')
    .description('CLI tool for creating URPC projects')
    .version(packageJson.version);

  program
    .command('create')
    .description('Create a new URPC project')
    .argument('<project-name>', 'Name of the project')
    .action(createCommand);

  program.parse();
}

main().catch(console.error); 