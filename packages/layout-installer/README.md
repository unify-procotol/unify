# @unilab/layout-installer

🎨 shadcn/ui style component registry for beautiful URPC layout components

## ✨ New Installation Method

We've upgraded to use **shadcn/ui's component installation system**! This means you can now install layout components directly using URLs, just like official shadcn/ui components.

## 🚀 Quick Installation

### Install Individual Components

```bash
# Install card layout (automatically includes Tailwind CSS dependencies)
npx shadcn@latest add https://layouts.unilab.dev/r/card-layout.json

# Install blog layout (automatically includes Tailwind CSS dependencies)
npx shadcn@latest add https://layouts.unilab.dev/r/blog-layout.json

# Install social media layout
npx shadcn@latest add https://layouts.unilab.dev/r/social-layout.json

# Install magazine layout
npx shadcn@latest add https://layouts.unilab.dev/r/magazine-layout.json

# Install minimal layout
npx shadcn@latest add https://layouts.unilab.dev/r/minimal-layout.json

# Install common UI components
npx shadcn@latest add https://layouts.unilab.dev/r/common-ui.json
```

### Install All Components at Once

```bash
# Install all layout components (automatically includes Tailwind CSS dependencies)
npx shadcn@latest add https://layouts.unilab.dev/r/all-layouts.json
```

### Manual Installation (Alternative)

```bash
# Install all components individually (each includes Tailwind CSS dependencies)
npx shadcn@latest add \
  https://layouts.unilab.dev/r/card-layout.json \
  https://layouts.unilab.dev/r/blog-layout.json \
  https://layouts.unilab.dev/r/social-layout.json \
  https://layouts.unilab.dev/r/magazine-layout.json \
  https://layouts.unilab.dev/r/minimal-layout.json \
  https://layouts.unilab.dev/r/common-ui.json
```

## 📦 Available Components

| Component | Description | Installation Command |
|-----------|-------------|---------------------|
| **Card Layout** | Daily.dev inspired card grid | `npx shadcn@latest add https://layouts.unilab.dev/r/card-layout.json` |
| **Blog Layout** | Modern blog article list | `npx shadcn@latest add https://layouts.unilab.dev/r/blog-layout.json` |
| **Social Layout** | Social media style feed | `npx shadcn@latest add https://layouts.unilab.dev/r/social-layout.json` |
| **Magazine Layout** | Magazine-style articles | `npx shadcn@latest add https://layouts.unilab.dev/r/magazine-layout.json` |
| **Minimal Layout** | Clean minimalist list | `npx shadcn@latest add https://layouts.unilab.dev/r/minimal-layout.json` |
| **Common UI** | Loading & error states | `npx shadcn@latest add https://layouts.unilab.dev/r/common-ui.json` |

## 🎯 Prerequisites

Before installing layout components, make sure you have:

1. **shadcn/ui initialized** in your project:
   ```bash
   npx shadcn@latest init
   ```

2. **Tailwind CSS** configured (usually done by shadcn/ui init)

3. **React 16.8+** for hooks support

## 💻 Usage

After installation, components will be added to your project. Import and use them with URPC:

```tsx
import { UniRender } from '@unilab/urpc';
import { renderCustomCardLayout } from './components/custom-layouts';

function MyComponent() {
  return (
    <UniRender 
      adapter={myAdapter}
      entity={MyEntity}
      renderAs={renderCustomCardLayout}
      options={{
        // Layout customization options
      }}
    />
  );
}
```

## 🎨 Component Examples

### Card Layout Usage
```tsx
import { renderCustomCardLayout } from './components/custom-layouts';

// Use with URPC
<UniRender 
  adapter={dataAdapter}
  entity={PostEntity}
  renderAs={renderCustomCardLayout}
/>
```

### Blog Layout Usage
```tsx
import { renderBlogLayout } from './components/custom-blog-layout';

// Perfect for articles and blog posts
<UniRender 
  adapter={blogAdapter}
  entity={ArticleEntity}
  renderAs={renderBlogLayout}
/>
```

### Loading & Error States
```tsx
import { LoadingState, ErrorState } from './components/common-ui';

// Use with conditional rendering
{isLoading && <LoadingState />}
{error && <ErrorState message={error.message} />}
```

## 🏗️ Project Structure After Installation

After running installation commands, your project will have:

```
src/
├── components/
│   ├── custom-layouts.tsx        # Card layout
│   ├── custom-blog-layout.tsx    # Blog layout
│   ├── custom-social-layout.tsx  # Social layout
│   ├── custom-magazine-layout.tsx # Magazine layout
│   ├── custom-minimal-layout.tsx # Minimal layout
│   └── common-ui.tsx             # Common components
└── ...
```

## 🔧 Local Development

### Run Registry Server Locally

For testing or contributing:

```bash
# Clone the repository
git clone https://github.com/unify-procotol/unify.git
cd unify/packages/layout-installer

# Install dependencies
npm install

# Build registry files
npm run registry:build

# Start local server
npm run registry:serve
```

Then use local URLs:
```bash
npx shadcn@latest add http://localhost:3001/r/card-layout.json
```

## 🌐 Registry API

### Browse Available Components
Visit: `https://layouts.unilab.dev/registry`

### Component Metadata
Each component provides:
- JSON schema validation
- TypeScript definitions
- Tailwind CSS classes
- Usage examples
- Dependency information

## ⚡ Benefits of New Installation Method

✅ **No npm dependencies** - Components are copied directly to your project  
✅ **Version control friendly** - Components become part of your codebase  
✅ **Customizable** - Modify components after installation  
✅ **Framework agnostic** - Works with any React setup  
✅ **Official shadcn/ui workflow** - Familiar installation process  
✅ **Self-contained** - No external package dependencies  

## 🆕 Migration from Old Version

If you were using the old npm-based installation:

1. **Uninstall old package**:
   ```bash
   npm uninstall @unilab/layout-installer
   ```

2. **Install shadcn/ui** (if not already):
   ```bash
   npx shadcn@latest init
   ```

3. **Install components using new method**:
   ```bash
   npx shadcn@latest add https://layouts.unilab.dev/r/card-layout.json
   ```

## 🤝 Contributing

We welcome contributions! To add new layout components:

1. Fork the repository
2. Add your component to `registry/default/[component-name]/`
3. Update `registry.json`
4. Run `npm run registry:build`
5. Test installation locally
6. Submit a pull request

## 📄 License

MIT License - see [LICENSE.md](./LICENSE.md) for details.

## 🔗 Links

- **Documentation**: [https://docs.unilab.dev](https://docs.unilab.dev)
- **Registry**: [https://layouts.unilab.dev](https://layouts.unilab.dev)
- **GitHub**: [https://github.com/unify-procotol/unify](https://github.com/unify-procotol/unify)
- **Issues**: [Report a bug](https://github.com/unify-procotol/unify/issues)

---

Made with ❤️ by the Unilab Team 