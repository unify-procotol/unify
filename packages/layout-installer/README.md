# @unilab/layout-installer

🎨 One-click installer for beautiful URPC layout components

## Features

- 📦 **One-click Install**: Quick installation using `npx` commands
- 🎨 **Multiple Layouts**: 5+ different layout templates available
- 🔧 **Interactive Setup**: Choose which layout components to install
- 📂 **Custom Paths**: Configurable installation directory
- 🚀 **Plug & Play**: Ready to use after installation, no extra setup required

## Installation & Usage

### Quick Start

Run in your project root directory:

```bash
npx @unilab/layout-installer
```

Or use the short command:

```bash
npx unilab-layouts
```

### Interactive Installation

After running the command, you'll see an interactive interface:

1. **Select Layouts**: Choose which layout components to install
2. **Choose Directory**: Specify installation path (default: `src/components/layouts`)
3. **Auto Install**: System automatically copies files and generates index file

## Available Layouts

### 🏷️ Card Layout
- **File**: `custom-layouts.tsx`
- **Function**: `renderCustomCardLayout`
- **Style**: daily.dev inspired card grid layout
- **Use Cases**: News, articles, product showcase

### 📖 Blog Layout
- **File**: `custom-blog-layout.tsx`
- **Function**: `renderBlogLayout`
- **Style**: Modern blog article list layout
- **Use Cases**: Blogs, news sites, content platforms

### 📱 Social Layout
- **File**: `custom-social-layout.tsx`
- **Function**: `renderSocialLayout`
- **Style**: Social media style feed layout
- **Use Cases**: Social platforms, activity feeds

### 📰 Magazine Layout
- **File**: `custom-magazine-layout.tsx`
- **Function**: `renderMagazineLayout`
- **Style**: Magazine-style article list
- **Use Cases**: News, magazines, journals

### ⚡ Minimal Layout
- **File**: `custom-minimal-layout.tsx`
- **Function**: `renderMinimalLayout`
- **Style**: Minimalist list layout
- **Use Cases**: Clean content display

### 🔧 Common UI Components
- **File**: `common-ui.tsx`
- **Components**: `LoadingState`, `ErrorState`
- **Purpose**: Loading and error state components

## Usage

### 1. Import Layout Components

```tsx
import { 
  renderCustomCardLayout,
  renderBlogLayout,
  LoadingState,
  ErrorState
} from './src/components/layouts';
```

### 2. Use in URPC Components

```tsx
import { UniRender } from '@unilab/urpc';
import { renderCustomCardLayout } from './components/layouts';

function MyComponent() {
  return (
    <UniRender 
      adapter={myAdapter}
      entity={MyEntity}
      renderAs={renderCustomCardLayout}
      options={{
        // Layout options
      }}
    />
  );
}
```

### 3. Customize Styles

All layouts use Tailwind CSS classes. You can:

- Directly modify the generated files to customize styles
- Override default styles through Tailwind configuration
- Add custom styles using CSS-in-JS

## Requirements

- **React**: ≥ 16.8.0
- **Tailwind CSS**: ≥ 3.0.0 (recommended)
- **URPC**: ≥ 1.0.0

## Project Structure

After installation, your project structure:

```
src/
  components/
    layouts/
      ├── custom-layouts.tsx       # Card layout
      ├── custom-blog-layout.tsx   # Blog layout
      ├── custom-social-layout.tsx # Social layout
      ├── custom-magazine-layout.tsx # Magazine layout
      ├── custom-minimal-layout.tsx # Minimal layout
      ├── common-ui.tsx           # Common UI components
      └── index.ts               # Auto-generated index file
```

## Advanced Configuration

### Custom Installation Path

```bash
# Specify custom path
npx @unilab/layout-installer
# Then in the interactive interface, enter: components/ui/layouts
```

### Selective Installation

You can install only the layout components you need instead of all of them. Simply uncheck components you don't need in the interactive interface.

### Style Customization

Each layout component accepts `options` parameter for customization:

```tsx
const customOptions = {
  className: 'my-custom-class',
  showImages: false,
  compact: true
};

<UniRender 
  renderAs={(data, options) => renderCustomCardLayout(data, { ...options, ...customOptions })}
/>
```

## Troubleshooting

### Common Issues

**Q: Styles not displaying correctly after installation?**
A: Make sure Tailwind CSS is installed and configured in your project.

**Q: TypeScript errors?**
A: Ensure `@types/react` and related type definitions are installed.

**Q: Cannot import components?**
A: Check if the installation path is correct and confirm `index.ts` file is generated.

### Reinstall

If you encounter issues during installation, you can delete the installation directory and run the installation command again:

```bash
rm -rf src/components/layouts
npx @unilab/layout-installer
```

## Development

### Local Development

```bash
# Clone the project
git clone <repo-url>
cd packages/layout-installer

# Install dependencies
npm install

# Build project
npm run build

# Test installer
npm link
npx @unilab/layout-installer
```

### Adding New Layouts

1. Add a new `.tsx` file in the `templates/` directory
2. Add configuration to the `layouts` array in `src/index.ts`
3. Update the export logic in the `generateIndexFile` function

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!

---

Made with ❤️ by Unilab Team 