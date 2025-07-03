# @unilab/unify-ui

A flexible and elegant UI rendering library for dynamic data visualization with multiple layout options.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @unilab/unify-ui
# Install peer dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Tailwind CSS

Update your `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // 📦 Include @unilab/unify-ui components
    "./node_modules/@unilab/unify-ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🎨 Pre-configured colors with sensible defaults
      colors: {
        border: "hsl(var(--border, 214.3 31.8% 91.4%))",
        input: "hsl(var(--input, 214.3 31.8% 91.4%))",
        ring: "hsl(var(--ring, 221.2 83.2% 53.3%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 222.2 84% 4.9%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 221.2 83.2% 53.3%))",
          foreground: "hsl(var(--primary-foreground, 210 40% 98%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 210 40% 96%))",
          foreground: "hsl(var(--secondary-foreground, 222.2 84% 4.9%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 84.2% 60.2%))",
          foreground: "hsl(var(--destructive-foreground, 210 40% 98%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 210 40% 96%))",
          foreground: "hsl(var(--muted-foreground, 215.4 16.3% 46.9%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 210 40% 96%))",
          foreground: "hsl(var(--accent-foreground, 222.2 84% 4.9%))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover, 0 0% 100%))",
          foreground: "hsl(var(--popover-foreground, 222.2 84% 4.9%))",
        },
        card: {
          DEFAULT: "hsl(var(--card, 0 0% 100%))",
          foreground: "hsl(var(--card-foreground, 222.2 84% 4.9%))",
        },
      },
      borderRadius: {
        lg: "var(--radius, 0.5rem)",
        md: "calc(var(--radius, 0.5rem) - 2px)",
        sm: "calc(var(--radius, 0.5rem) - 4px)",
      },
    },
  },
  plugins: [],
}
```

### 3. Add CSS Styles

Create or update your CSS file (globals.css):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 基础颜色变量 - 可自定义覆盖 */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }

  body {
    @apply bg-background text-foreground;
  }
}
```

### 4. Import CSS and Start Using

```jsx
import './globals.css';
import { UniRender } from '@unilab/unify-ui';

// 🎉 Works immediately with beautiful default colors!
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
      layout="table"
    />
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