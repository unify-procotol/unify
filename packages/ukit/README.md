# @unilab/ukit

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
npm install @unilab/ukit
# Install peer dependencies (Tailwind CSS v4+ required)
npm install -D tailwindcss@^4.0.0 @tailwindcss/vite tailwindcss-animate
npx tailwindcss init
pnpm dlx shadcn@latest init
@source '../../../packages/ukit/dist/**/*.{js,ts,jsx,tsx}'; 
@source '../../../packages/ukit/src/**/*.{js,ts,jsx,tsx}';
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
import { UniRender } from '@unilab/ukit';

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

## Custom Layout

UniRender now supports a custom layout type that allows you to define your own rendering logic while still benefiting from built-in pagination, filtering, and data management.

### Basic Usage

```jsx
import { UniRender } from '@unilab/ukit';

function CustomCardView() {
  return (
    <UniRender
      entity="User"
      source="memory"
      layout="custom"
      render={(data, options) => (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((record, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md">
              <h3 className="font-semibold">{record.name}</h3>
              <p className="text-sm text-gray-600">{record.email}</p>
              <div className="mt-2 flex gap-2">
                <button 
                  onClick={() => options.onEdit(record, index)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button 
                  onClick={() => options.onDelete(record, index)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      pagination={{
        enabled: true,
        pageSize: 6,
      }}
    />
  );
}
```

### Advanced Usage with Custom Actions

```jsx
import { UniRender } from '@unilab/ukit';

function AdvancedCustomView() {
  return (
    <UniRender
      entity="User"
      source="memory"
      layout="custom"
      generalConfig={{
        actions: {
          custom: [
            {
              label: 'View Profile',
              onClick: async (record, index, entityInstance, refresh) => {
                // Custom action logic
                console.log('Viewing profile:', record);
              }
            },
            {
              label: 'Send Message',
              onClick: async (record, index, entityInstance, refresh) => {
                // Another custom action
                console.log('Sending message to:', record.email);
              }
            }
          ]
        }
      }}
      render={(data, options) => (
        <div className="space-y-4">
          {data.map((record, index) => (
            <div key={index} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{record.name}</h3>
                  <p className="text-gray-600 mt-1">{record.email}</p>
                  <div className="mt-3 text-sm text-gray-500">
                    Record #{options.startIndex + index + 1} of {options.totalRecords}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {/* Built-in edit/delete actions */}
                  <button 
                    onClick={() => options.onEdit(record, index)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => options.onDelete(record, index)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    disabled={options.deletingIndex === index}
                  >
                    {options.deletingIndex === index ? 'Deleting...' : 'Delete'}
                  </button>
                  
                  {/* Custom actions */}
                  {options.generalConfig?.actions?.custom?.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={options.createActionHandler(action, record, index)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      pagination={{
        enabled: true,
        pageSize: 5,
      }}
    />
  );
}
```

### Custom Layout Options

The `render` function receives data and an options object with the following properties:

- `fields`: Array of entity fields
- `config`: Field configuration
- `generalConfig`: General configuration
- `onEdit`: Function to trigger edit modal
- `onDelete`: Function to trigger delete action
- `createActionHandler`: Function to create custom action handlers
- `deletingIndex`: Index of record being deleted (for loading states)
- `currentPage`: Current page number
- `pageSize`: Number of records per page
- `startIndex`: Starting index of current page
- `endIndex`: Ending index of current page
- `totalRecords`: Total number of records

### Pagination Configuration

```jsx
<UniRender
  layout="custom"
  pagination={{
    enabled: true,           // Enable/disable pagination
    pageSize: 10,           // Records per page
    currentPage: 1,         // Current page (for controlled pagination)
    onPageChange: (page) => {  // Page change handler
      console.log('Page changed to:', page);
    }
  }}
  render={(data, options) => {
    // Your custom rendering logic
    return <div>...</div>;
  }}
/>
```

The custom layout automatically handles:
- Header with search and filter controls
- Pagination controls
- Add record modal
- Edit record modal
- Delete confirmation modal
- Loading states
- Error handling 