export interface Template {
  name: string;
  displayName: string;
  description: string;
  githubPath: string;
  defaultPort: number;
  startScript: string;
}

export interface PackageManager {
  name: 'npm' | 'yarn' | 'pnpm' | 'bun';
  displayName: string;
  installCommand: string;
  runCommand: string;
}

export interface ProjectConfig {
  name: string;
  template: Template;
  targetDir: string;
  packageManager: PackageManager;
}

export const TEMPLATES: Template[] = [
  {
    name: 'hono-basic',
    displayName: 'Hono Basic',
    description: 'A basic Hono server with URPC integration',
    githubPath: 'unify-procotol/unify',
    defaultPort: 3000,
    startScript: 'dev'
  },
  {
    name:'react-todo',
    displayName: 'React Todo App',
    description: 'A simple todo list app with React and URPC',
    githubPath: 'unify-procotol/unify',
    defaultPort: 3000,
    startScript: 'dev'
  },
  {
    name: 'nextjs-app-router',
    displayName: 'Next.js App Router',
    description: 'Next.js 13+ with App Router and URPC',
    githubPath: 'unify-procotol/unify',
    defaultPort: 3000,
    startScript: 'dev'
  },
  {
    name: 'nextjs-pages-router',
    displayName: 'Next.js Pages Router',
    description: 'Next.js with Pages Router and URPC',
    githubPath: 'unify-procotol/unify',
    defaultPort: 3000,
    startScript: 'dev'
  },
  {
    name: 'ai-chat-example',
    displayName: 'AI Chat Example',
    description: 'A simple AI chat example with URPC',
    githubPath: 'unify-procotol/unify',
    defaultPort: 3000,
    startScript: 'dev'
  }
];

export const PACKAGE_MANAGERS: PackageManager[] = [
  {
    name: 'npm',
    displayName: 'npm',
    installCommand: 'npm install',
    runCommand: 'npm run'
  },
  {
    name: 'yarn',
    displayName: 'Yarn',
    installCommand: 'yarn install',
    runCommand: 'yarn'
  },
  {
    name: 'pnpm',
    displayName: 'pnpm',
    installCommand: 'pnpm install',
    runCommand: 'pnpm'
  },
  {
    name: 'bun',
    displayName: 'Bun',
    installCommand: 'bun install',
    runCommand: 'bun run'
  }
];

export const STUDIO_URL = 'https://studio.uni-labs.org';

/**
 * Get the correct command for the current platform
 * On Windows, npm/yarn/pnpm are .cmd files
 */
export function getPlatformCommand(command: string): string {
  if (process.platform === 'win32') {
    if (['npm', 'yarn', 'pnpm'].includes(command)) {
      return `${command}.cmd`;
    }
  }
  return command;
} 