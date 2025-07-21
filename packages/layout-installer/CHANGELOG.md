# Changelog

All notable changes to `@unilab/layout-installer` will be documented in this file.

## [0.0.1] - 2025-07-21

### Added

- 🎉 Initial release of layout installer
- 📦 Interactive CLI for installing layout components
- 🎨 5 pre-built layout templates:
  - Card Layout (daily.dev inspired)
  - Blog Layout (modern article layout)
  - Social Layout (social media style)
  - Magazine Layout (magazine-style articles)
  - Minimal Layout (clean and simple)
- 🔧 Common UI components (LoadingState, ErrorState)
- 📂 Configurable installation directory
- 🚀 Automatic index file generation
- ⚙️ **Automatic Configuration Setup**:
  - Tailwind CSS configuration detection and creation
  - PostCSS configuration detection and creation (supports `.js`, `.mjs`, `.ts`)
  - CSS file with Tailwind directives auto-generation
- 📦 **Smart Dependency Management**:
  - Automatic detection of missing dependencies (tailwindcss, autoprefixer, postcss)
  - Multi-package manager support (npm, yarn, pnpm, bun)
  - Interactive dependency installation
- ✨ TypeScript support with proper type definitions
- 📖 Comprehensive documentation

### Features

- Interactive component selection
- Custom installation paths
- Complete Tailwind CSS + PostCSS setup automation
- Automatic dependency detection and installation
- Error handling and recovery
- Colored terminal output
- Cross-platform compatibility
- Clean, formatted output files

### Dependencies

- React support (≥16.8.0)
- Tailwind CSS integration (≥3.0.0)
- PostCSS integration
- TypeScript type definitions 