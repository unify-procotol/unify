# @unilab/urpc-ui

A flexible and elegant UI rendering library for dynamic data visualization with multiple layout options. Built with **shadcn/ui** components for modern, accessible design.

## ✨ Features

- 🎨 **shadcn/ui Integration**: Beautiful, accessible components out of the box
- 🌙 **Dark Mode Support**: Built-in dark/light theme switching
- 📱 **Responsive Design**: Works perfectly on all device sizes
- 🎯 **Multiple Layouts**: Table, Card, Dashboard, Form, Grid, and List views
- 🔧 **Highly Customizable**: Override colors, layouts, and behavior
- 🚀 **TypeScript**: Full type safety and IntelliSense
- 📦 **Built-in Dependencies**: All Radix UI components and utilities included
- 🎨 **Auto CSS**: Styles automatically imported, no manual setup required

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @unilab/unify-ui
# Install peer dependencies (Tailwind CSS v4+ required)
npm install -D tailwindcss@^4.0.0 @tailwindcss/vite tailwindcss-animate
npx tailwindcss init
pnpm dlx shadcn@latest init
@source '../../../packages/unify-ui/dist/**/*.{js,ts,jsx,tsx}'; 
@source '../../../packages/unify-ui/src/**/*.{js,ts,jsx,tsx}';
```

> 🎉 **All shadcn/ui and Radix components are now built-in!** No need to install them separately.

### 📦 Development & Build

This package is built with **Vite** for optimal performance and modern ESM/CJS output:

```bash
# Development (watch mode)
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

**Output formats:**
- ESM: `dist/index.esm.js`
- CommonJS: `dist/index.cjs.js`
- TypeScript declarations: `dist/index.d.ts`

### 🔧 Vite Configuration (Optional)

If you're using Vite, you can use the official Tailwind CSS Vite plugin:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 3. Start Using

```jsx
import { UniRender } from '@unilab/unify-ui';

function App() {
  const entity = {
    name: 'User',
    fields: [
      { name: 'id', type: 'number', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'email', type: 'string', required: true },
    ]
  };

  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  return (
    <UniRender
      entity={entity}
      data={data}
      layout="card"
      generalConfig={{
        showActions: true,
        actions: {
          edit: true,
          delete: true
        }
      }}
      onEdit={(record, index) => console.log('Edit:', record)}
      onDelete={(record, index) => console.log('Delete:', record)}
    />
  );
}
```

### 4. Enable Dark Mode (Optional)

Add dark mode toggle to your app:

```jsx
function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={isDark ? 'dark' : ''}>
      <button 
        onClick={() => setIsDark(!isDark)}
        className="mb-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        Toggle {isDark ? 'Light' : 'Dark'} Mode
      </button>
      
      <UniRender
        entity={entity}
        data={data}
        layout="dashboard"
      />
    </div>
  );
}
```

## 🎨 Advanced Customization (Optional)

Want custom colors? Just override with CSS variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Override any color you want - others use defaults */
    --primary: 142 76% 36%;        /* Custom green */
    --primary-foreground: 0 0% 98%;
    --secondary: 210 40% 96%;
    /* No need to define all colors! */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* Add dark mode overrides */
  }
}
```

## 📱 Layout Options

| Layout | Description | Best For |
|--------|-------------|----------|
| `table` | Data table with sorting | Large datasets |
| `card` | Card-based layout | Visual browsing |
| `grid` | Compact grid display | Gallery view |
| `list` | Simple list format | Mobile-friendly |
| `form` | Detailed form view | Single record |
| `dashboard` | Analytics view | Statistics |

## 🛠️ Configuration

```tsx
<UniRender
  entity={entity}
  data={data}
  layout="table"
  config={{
    field_name: {
      label: "Custom Label",
      width: "200px",
      align: "center"
    }
  }}
  generalConfig={{
    showActions: true,
    actions: { edit: true, delete: true }
  }}
  onEdit={(record, index) => console.log('Edit', record)}
  onDelete={(record, index) => console.log('Delete', record)}
/>
```

## ✨ Key Features

- **🚀 Zero Configuration**: Works with default colors out-of-the-box
- **🎨 Easy Customization**: Override only the colors you want
- **📱 Responsive Design**: Mobile-first layouts
- **⚡ Performance**: Optimized rendering for large datasets
- **🔧 Type Safe**: Full TypeScript support
- **🎯 Flexible**: Multiple layout options for different use cases

## 📄 License

MIT 