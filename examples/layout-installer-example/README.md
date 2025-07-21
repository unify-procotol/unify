# Layout Installer Example Project

This example demonstrates how to use `@unilab/layout-installer` to install and use layout components.

## Installation Steps

1. **Install project dependencies**
```bash
bun install
```

2. **Use layout-installer to install layout components**
```bash
# Method 1: Use local development version
bun run install-layouts

# Method 2: Use npx (after publishing)
npx @unilab/layout-installer
```

3. **Select layouts to install**
- Choose needed layout components in the interactive interface
- Specify installation directory (default: src/components/layouts)

## Usage

After installation, you can import and use these layouts in your React components:

```tsx
import { 
  renderCustomCardLayout,
  renderBlogLayout,
  LoadingState 
} from './src/components/layouts';

// Use in URPC components
function MyComponent() {
  return (
    <UniRender 
      adapter={myAdapter}
      entity={MyEntity}
      renderAs={renderCustomCardLayout}
    />
  );
}
```

## Available Layouts

- **Card Layout**: Card grid layout
- **Blog Layout**: Blog article layout  
- **Social Layout**: Social media layout
- **Magazine Layout**: Magazine-style layout
- **Minimal Layout**: Minimal layout
- **Common UI**: Common UI components

## Development

```bash
# Start development server
bun run dev

# Build project
bun run build
``` 