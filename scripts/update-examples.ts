#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

interface Config {
  publishedPackages: string[];
  exampleDirs: string[];
}

const CONFIG: Config = {
  publishedPackages: [
    '@unilab/urpc-core',
    '@unilab/urpc', 
    '@unilab/urpc-hono',
    '@unilab/urpc-next',
    '@unilab/urpc-adapters',
    '@unilab/builtin-plugin',
    '@unilab/urpc',
    '@unilab/uniweb3',
    '@unilab/ukit',
    '@unify/urpc-cli'
  ],
  
  exampleDirs: [
    'examples/hono-basic',
    'examples/react-todo',
    'examples/nextjs-app-router',
    'examples/nextjs-pages-router'
  ]
};


function getPackageVersion(packageName: string): string | null {
  try {
    const localPackageName = packageName.replace('@unilab/', '').replace('@unify/', '');
    const packageJsonPath = path.join(process.cwd(), 'packages', localPackageName, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version;
    }
    
    const result = execSync(`npm view ${packageName} version`, { encoding: 'utf8' });
    return result.trim();
  } catch (error) {
    console.warn(`Warning: Could not get version for ${packageName}`);
    return null;
  }
}


function updatePackageJson(filePath: string, versions: Record<string, string>, useWorkspace = false): void {
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${filePath} does not exist`);
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let hasChanges = false;

  // 更新 dependencies 和 devDependencies
  ['dependencies', 'devDependencies'].forEach(depType => {
    if (packageJson[depType]) {
      Object.keys(packageJson[depType]).forEach(packageName => {
        if (CONFIG.publishedPackages.includes(packageName)) {
          const currentValue = packageJson[depType][packageName];
          const newValue = useWorkspace ? 'workspace:*' : `^${versions[packageName]}`;
          
          if (currentValue !== newValue && versions[packageName]) {
            packageJson[depType][packageName] = newValue;
            hasChanges = true;
            console.log(`  ${packageName}: ${currentValue} -> ${newValue}`);
          }
        }
      });
    }
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✅ Updated ${filePath}`);
  } else {
    console.log(`⚪ No changes needed for ${filePath}`);
  }
}


function main(): void {
  const args = process.argv.slice(2);
  const useWorkspace = args.includes('--workspace') || args.includes('-w');
  const mode = useWorkspace ? 'workspace' : 'latest versions';
  
  console.log(`🚀 Updating examples to use ${mode}...\n`);


  const versions: Record<string, string> = {};
  if (!useWorkspace) {
    console.log('📦 Getting package versions...');
    CONFIG.publishedPackages.forEach(packageName => {
      const version = getPackageVersion(packageName);
      if (version) {
        versions[packageName] = version;
        console.log(`  ${packageName}: ${version}`);
      }
    });
    console.log('');
  }


  console.log('📝 Updating example projects...');
  CONFIG.exampleDirs.forEach(dir => {
    const packageJsonPath = path.join(process.cwd(), dir, 'package.json');
    console.log(`\n📂 ${dir}:`);
    updatePackageJson(packageJsonPath, versions, useWorkspace);
  });

  console.log('\n🎉 Update complete!');
  
  if (!useWorkspace) {
    console.log('\n💡 Tips:');
    console.log('- Examples now use the latest published versions');
    console.log('- Run with --workspace flag to switch back to workspace dependencies');
  } else {
    console.log('\n💡 Tips:');
    console.log('- Examples now use workspace dependencies for local development');
    console.log('- Run without --workspace flag to use published versions');
  }
}


if (require.main === module) {
  main();
}

module.exports = { main, updatePackageJson, getPackageVersion }; 