const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Component access without .json suffix (e.g., /r/blog-layout)
app.get('/r/:componentName', (req, res, next) => {
  const componentName = req.params.componentName;
  
  // Skip if it already has .json extension
  if (componentName.endsWith('.json')) {
    return next();
  }
  
  const jsonFilePath = path.join(__dirname, 'public', 'r', `${componentName}.json`);
  
  // Check if the JSON file exists
  if (fs.existsSync(jsonFilePath)) {
    // Set proper content-type and serve the JSON file
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(jsonFilePath);
  } else {
    res.status(404).json({ 
      error: 'Component not found',
      component: componentName,
      available: '/registry'
    });
  }
});

// Registry listing endpoint - update URLs to remove .json
app.get('/registry', (req, res) => {
  res.json({
    name: 'unilab-layouts',
    description: 'Layout components registry for URPC projects',
    components: [
      {
        name: 'card-layout',
        url: `${req.protocol}://${req.get('host')}/r/card-layout`,
        description: 'Modern card layout inspired by daily.dev'
      },
      {
        name: 'blog-layout',
        url: `${req.protocol}://${req.get('host')}/r/blog-layout`,
        description: 'Clean blog-style layout'
      },
      {
        name: 'social-layout',
        url: `${req.protocol}://${req.get('host')}/r/social-layout`,
        description: 'Social media style feed layout'
      },
      {
        name: 'magazine-layout',
        url: `${req.protocol}://${req.get('host')}/r/magazine-layout`,
        description: 'Magazine-style article layout'
      },
      {
        name: 'minimal-layout',
        url: `${req.protocol}://${req.get('host')}/r/minimal-layout`,
        description: 'Minimalist list layout'
      },
      {
        name: 'common-ui',
        url: `${req.protocol}://${req.get('host')}/r/common-ui`,
        description: 'Common UI components'
      }
    ]
  });
});

// Redirect root to registry listing
app.get('/', (req, res) => {
  res.redirect('/registry');
});

app.listen(PORT, () => {
  console.log(`🚀 Layout Registry Server running at http://localhost:${PORT}`);
  console.log(`📦 Registry API: http://localhost:${PORT}/registry`);
  console.log(`🔗 Component URLs: http://localhost:${PORT}/r/[component-name]`);
  console.log(`💡 Both /r/component-name and /r/component-name.json are supported`);
}); 