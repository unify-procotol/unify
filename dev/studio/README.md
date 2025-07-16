# URPC Studio

A powerful web-based administration interface for URPC servers, providing an intuitive way to explore, manage, and interact with your data entities.

## Overview

URPC Studio is a modern, responsive web application that connects to URPC servers and provides a rich user interface for data management. Built with React, TypeScript, and Tailwind CSS, it offers both traditional table views and modern card-based layouts.

## Features

### Core Features
- **Entity Explorer**: Browse all entities and their schemas with an intuitive tree view
- **Data Sources**: Switch between different data sources for each entity
- **Real-time Data**: Live data updates with refresh capability
- **Schema Validation**: Built-in validation based on entity schemas
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Layout Options
- **Table Layout**: Traditional tabular view with sorting, filtering, and pagination
- **Custom Card Layout**: Rich visual cards featuring:
  - Gradient headers with random colors
  - Author avatars with initials
  - Metadata display (creation date, reading time)
  - Dynamic tags based on entity properties
  - Hover animations and transitions
  - Responsive grid layout

### Data Management
- **CRUD Operations**: Create, read, update, and delete records
- **Modal Dialogs**: Intuitive forms for adding and editing records
- **Batch Operations**: Select and manage multiple records
- **Advanced Pagination**: Configurable page sizes and navigation
- **Search and Filter**: Real-time search across all fields

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- A running URPC server

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Building
```bash
npm run build
```

## Usage

### Connecting to a Server
1. Start your URPC server
2. Open URPC Studio in your browser
3. Enter your server URL in the connection form
4. Click "Connect"

### Working with Entities
1. **Browse Entities**: Use the left sidebar to explore available entities
2. **Select Data Source**: Choose from available data sources for each entity
3. **View Data**: Select between table and card layouts using the layout selector
4. **Manage Records**: Add, edit, or delete records using the action buttons

### Layout Selection
- **Table Mode**: Click the "Table" button for traditional tabular view
- **Card Mode**: Click the "Cards" button for rich visual card layout

## Custom Layout Features

The custom card layout offers a modern, visually appealing alternative to traditional tables:

### Visual Design
- **Gradient Headers**: Each card features a unique gradient background
- **Avatar System**: Displays user initials in circular avatars
- **Rich Typography**: Clean, readable text with proper hierarchy
- **Hover Effects**: Smooth animations and shadows on interaction

### Smart Content
- **Auto-generated Tags**: Creates tags from entity properties
- **Content Preview**: Shows truncated content with ellipsis
- **Metadata Display**: Formats dates and calculates reading time
- **Responsive Grid**: Adapts to different screen sizes

### Performance
- **Optimized Rendering**: Efficient rendering for large datasets
- **Configurable Pagination**: Default 8 items per page for optimal performance
- **Lazy Loading**: Loads data on-demand for better performance

## Configuration

### Entity Configuration
Customize how entities are displayed by modifying the `getFieldConfig` function:

```typescript
const getFieldConfig = (entity: string): Record<string, FieldConfig> => {
  return {
    name: { order: 1, label: "Full Name", width: "150px" },
    email: { order: 2, label: "Email Address", render: (value) => <a href={`mailto:${value}`}>{value}</a> },
    // ... more field configurations
  };
};
```

### Layout Customization
Modify the `renderCustomCardLayout` function to customize card appearance:

```typescript
const renderCustomCardLayout = (data: any[], options: any) => {
  // Custom rendering logic
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Card components */}
    </div>
  );
};
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: React Hooks
- **Data Fetching**: URPC Client
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages

## Architecture

### Components
- **StudioHome**: Main application component
- **EntityExplorer**: Left sidebar with entity tree
- **DataViewer**: Main content area with layout options
- **CustomLayout**: Card-based layout renderer
- **ActionModals**: Add/edit/delete modals

### Data Flow
1. Connect to URPC server
2. Fetch entity schemas
3. Load data for selected entity/source
4. Render in chosen layout
5. Handle user interactions

## Development

### Project Structure
```
src/
├── components/
│   ├── StudioHome.tsx      # Main application component
│   ├── ui/                 # Reusable UI components
│   └── ...
├── lib/
│   └── utils.ts            # Utility functions
└── ...
```

### Key Files
- `StudioHome.tsx`: Main application logic and layout switching
- `CustomLayout.tsx`: Card-based layout implementation (in ukit package)
- `types.ts`: TypeScript type definitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

## Roadmap

### Planned Features
- More layout options (list, grid, timeline)
- Advanced filtering and search
- Data export functionality
- Real-time collaboration
- Custom themes and styling
- Plugin system for extensions

### Recent Updates
- ✅ Added custom card layout
- ✅ Improved responsive design
- ✅ Enhanced pagination
- ✅ Better error handling
