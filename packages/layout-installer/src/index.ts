import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { execSync } from "child_process";

interface LayoutTemplate {
  name: string;
  description: string;
  files: string[];
}

const layouts: LayoutTemplate[] = [
  {
    name: "card-layout",
    description: "Modern card layout inspired by daily.dev",
    files: ["custom-layouts.tsx"],
  },
  {
    name: "blog-layout",
    description: "Clean blog-style layout",
    files: ["custom-blog-layout.tsx"],
  },
  {
    name: "minimal-layout",
    description: "Simple minimal layout",
    files: ["custom-minimal-layout.tsx"],
  },
  {
    name: "social-layout",
    description: "Social media style layout",
    files: ["custom-social-layout.tsx"],
  },
  {
    name: "magazine-layout",
    description: "Magazine-style article layout",
    files: ["custom-magazine-layout.tsx"],
  },
  {
    name: "common-ui",
    description: "Common UI components (LoadingState, ErrorState)",
    files: ["common-ui.tsx"],
  },
  {
    name: "all-layouts",
    description: "Install all available layouts",
    files: [
      "custom-layouts.tsx",
      "custom-blog-layout.tsx",
      "custom-minimal-layout.tsx",
      "custom-social-layout.tsx",
      "custom-magazine-layout.tsx",
      "common-ui.tsx",
    ],
  },
];

async function checkDependencies(currentDir: string): Promise<void> {
  const packageJsonPath = path.join(currentDir, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  const missingDeps: string[] = [];

  // Check for required dependencies
  if (!dependencies.tailwindcss) {
    missingDeps.push("tailwindcss");
  }
  if (!dependencies.autoprefixer) {
    missingDeps.push("autoprefixer");
  }
  if (!dependencies.postcss) {
    missingDeps.push("postcss");
  }

  if (missingDeps.length > 0) {
    console.log(
      chalk.yellow("⚠️  Missing required dependencies for layout components:")
    );
    missingDeps.forEach((dep) => console.log(chalk.yellow(`   • ${dep}`)));

    const { shouldInstall } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldInstall",
        message: "Would you like to install missing dependencies?",
        default: true,
      },
    ]);

    if (shouldInstall) {
      console.log(chalk.blue("📦 Installing dependencies..."));

      try {
        // Detect package manager
        const hasYarn = await fs.pathExists(path.join(currentDir, "yarn.lock"));
        const hasBun = await fs.pathExists(path.join(currentDir, "bun.lockb"));
        const hasPnpm = await fs.pathExists(
          path.join(currentDir, "pnpm-lock.yaml")
        );

        let installCmd = "";
        if (hasBun) {
          installCmd = `bun add -D ${missingDeps.join(" ")}`;
        } else if (hasYarn) {
          installCmd = `yarn add -D ${missingDeps.join(" ")}`;
        } else if (hasPnpm) {
          installCmd = `pnpm add -D ${missingDeps.join(" ")}`;
        } else {
          installCmd = `npm install -D ${missingDeps.join(" ")}`;
        }

        execSync(installCmd, { cwd: currentDir, stdio: "inherit" });
        console.log(chalk.green("✅ Dependencies installed successfully!"));
      } catch (error) {
        console.log(chalk.red("❌ Failed to install dependencies"));
        console.log(chalk.yellow("Please install them manually:"));
        console.log(chalk.white(`npm install -D ${missingDeps.join(" ")}`));
      }
    } else {
      console.log(
        chalk.yellow("Please install the following dependencies manually:")
      );
      console.log(chalk.white(`npm install -D ${missingDeps.join(" ")}`));
    }
  }
}

async function ensureTailwindConfig(
  currentDir: string,
  layoutPath: string
): Promise<void> {
  const tailwindConfigPath = path.join(currentDir, "tailwind.config.js");
  const tailwindConfigTsPath = path.join(currentDir, "tailwind.config.ts");

  let configPath = "";
  let configExists = false;

  if (await fs.pathExists(tailwindConfigPath)) {
    configPath = tailwindConfigPath;
    configExists = true;
  } else if (await fs.pathExists(tailwindConfigTsPath)) {
    configPath = tailwindConfigTsPath;
    configExists = true;
  }

  if (!configExists) {
    console.log(chalk.blue("📝 Creating Tailwind CSS config..."));
    const configContent = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./${layoutPath}/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    await fs.writeFile(tailwindConfigPath, configContent);
    console.log(chalk.green("✅ Created tailwind.config.js"));
  } else {
    console.log(
      chalk.yellow(
        "💡 Make sure your Tailwind config includes the layout path:"
      )
    );
    console.log(chalk.white(`   "./${layoutPath}/**/*.{js,ts,jsx,tsx}"`));
  }

  // Check for PostCSS config
  const postcssConfigPaths = [
    path.join(currentDir, "postcss.config.js"),
    path.join(currentDir, "postcss.config.mjs"),
    path.join(currentDir, "postcss.config.ts"),
  ];

  let postcssConfigExists = false;
  for (const configPath of postcssConfigPaths) {
    if (await fs.pathExists(configPath)) {
      postcssConfigExists = true;
      break;
    }
  }

  if (!postcssConfigExists) {
    console.log(chalk.blue("📝 Creating PostCSS config..."));
    const postcssConfigContent = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;

    await fs.writeFile(
      path.join(currentDir, "postcss.config.js"),
      postcssConfigContent
    );
    console.log(chalk.green("✅ Created postcss.config.js"));
  }

  // Check for CSS file with Tailwind directives
  const possibleCssPaths = [
    path.join(currentDir, "src/index.css"),
    path.join(currentDir, "src/styles/globals.css"),
    path.join(currentDir, "src/app/globals.css"),
  ];

  let cssExists = false;
  for (const cssPath of possibleCssPaths) {
    if (await fs.pathExists(cssPath)) {
      const content = await fs.readFile(cssPath, "utf-8");
      if (content.includes("@tailwind base")) {
        cssExists = true;
        break;
      }
    }
  }

  if (!cssExists) {
    const cssPath = path.join(currentDir, "src/index.css");
    const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles for layout components */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}`;

    await fs.ensureDir(path.dirname(cssPath));
    await fs.writeFile(cssPath, cssContent);
    console.log(
      chalk.green("✅ Created src/index.css with Tailwind directives")
    );
    console.log(
      chalk.yellow(
        "💡 Make sure to import this CSS file in your main component"
      )
    );
  }
}

async function main() {
  console.log(chalk.blue.bold("\n🎨 Unilab Layout Installer\n"));

  // Check if current directory is a valid project directory
  const currentDir = process.cwd();
  const packageJsonPath = path.join(currentDir, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.red("❌ No package.json found in current directory"));
    console.log(
      chalk.yellow("Please run this command in your project root directory")
    );
    process.exit(1);
  }

  // Check and install dependencies
  await checkDependencies(currentDir);

  try {
    // Select layouts to install
    const { selectedLayouts } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedLayouts",
        message: "Select layouts to install:",
        choices: layouts.map((layout) => ({
          name: `${layout.name} - ${layout.description}`,
          value: layout.name,
          checked: layout.name === "all-layouts",
        })),
        validate: (answer) => {
          if (answer.length < 1) {
            return "You must choose at least one layout.";
          }
          return true;
        },
      },
    ]);

    // Select installation directory
    const { installPath } = await inquirer.prompt([
      {
        type: "input",
        name: "installPath",
        message: "Enter installation directory:",
        default: "src/components/layouts",
        validate: (input) => {
          if (!input.trim()) {
            return "Installation path cannot be empty";
          }
          return true;
        },
      },
    ]);

    // Create installation directory
    const fullInstallPath = path.join(currentDir, installPath);
    await fs.ensureDir(fullInstallPath);

    // Ensure Tailwind CSS configuration
    await ensureTailwindConfig(currentDir, installPath);

    // Get list of files to install
    const filesToInstall = new Set<string>();

    for (const layoutName of selectedLayouts) {
      const layout = layouts.find((l) => l.name === layoutName);
      if (layout) {
        layout.files.forEach((file) => filesToInstall.add(file));
      }
    }

    console.log(chalk.green("\n📦 Installing layouts...\n"));

    // Copy files
    const templatePath = path.join(__dirname, "../templates");
    let installedCount = 0;

    for (const fileName of filesToInstall) {
      const sourcePath = path.join(templatePath, fileName);
      const targetPath = path.join(fullInstallPath, fileName);

      try {
        if (await fs.pathExists(sourcePath)) {
          await fs.copy(sourcePath, targetPath);
          console.log(chalk.green(`✅ Installed: ${fileName}`));
          installedCount++;
        } else {
          console.log(chalk.yellow(`⚠️  Template not found: ${fileName}`));
        }
      } catch (error) {
        console.log(chalk.red(`❌ Failed to install: ${fileName}`));
        console.log(
          chalk.red(
            `   Error: ${error instanceof Error ? error.message : String(error)}`
          )
        );
      }
    }

    // Create index file
    const indexPath = path.join(fullInstallPath, "index.ts");
    const indexContent = generateIndexFile(Array.from(filesToInstall));
    await fs.writeFile(indexPath, indexContent);
    console.log(chalk.green(`✅ Created: index.ts`));

    // Installation complete
    console.log(chalk.green.bold(`\n🎉 Installation completed!`));
    console.log(
      chalk.blue(
        `📂 Installed ${installedCount} layout files to: ${installPath}`
      )
    );

    // Show usage instructions
    console.log(chalk.cyan("\n📖 Usage:"));
    console.log(
      chalk.white(
        `import { renderCustomCardLayout, LoadingState } from './${path.relative(currentDir, fullInstallPath)}';`
      )
    );

    console.log(chalk.cyan("\n💡 Tips:"));
    console.log(
      chalk.white("• All required dependencies should now be installed")
    );
    console.log(
      chalk.white(
        "• Import and use the layout renderers in your URPC components"
      )
    );
    console.log(
      chalk.white("• Customize the layouts to match your design system")
    );
    console.log(
      chalk.white("• Make sure to import your CSS file in your main component")
    );
  } catch (error) {
    console.log(chalk.red("\n❌ Installation failed:"));
    console.log(
      chalk.red(error instanceof Error ? error.message : String(error))
    );
    process.exit(1);
  }
}

function generateIndexFile(installedFiles: string[]): string {
  const exports: string[] = [];

  for (const fileName of installedFiles) {
    const moduleName = fileName.replace(".tsx", "");

    switch (fileName) {
      case "custom-layouts.tsx":
        exports.push(
          `export { renderCustomCardLayout } from './${moduleName}';`
        );
        break;
      case "custom-blog-layout.tsx":
        exports.push(`export { renderBlogLayout } from './${moduleName}';`);
        break;
      case "custom-minimal-layout.tsx":
        exports.push(`export { renderMinimalLayout } from './${moduleName}';`);
        break;
      case "custom-social-layout.tsx":
        exports.push(`export { renderSocialLayout } from './${moduleName}';`);
        break;
      case "custom-magazine-layout.tsx":
        exports.push(`export { renderMagazineLayout } from './${moduleName}';`);
        break;
      case "common-ui.tsx":
        exports.push(
          `export { LoadingState, ErrorState } from './${moduleName}';`
        );
        break;
    }
  }

  return `// Auto-generated index file for installed layouts
${exports.join("\n")}

// Type definitions for layout renderers
export type LayoutRenderer = (data: any[], options?: any) => React.ReactElement;
export type LayoutOptions = Record<string, any>;
`;
}

// Run main program
main().catch(console.error);
