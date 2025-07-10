# Cloudflare Pages Deployment Guide

## Prerequisites

1. Install Cloudflare CLI tool (wrangler)
2. Have a Cloudflare account
3. Configure Cloudflare authentication

## Deployment Steps

### Documentation Site Deployment

#### 1. Login to Cloudflare
```bash
npx wrangler login
```

#### 2. Build Project
```bash
pnpm run pages:build
```

#### 3. Local Preview
```bash
pnpm run preview
```

#### 4. Deploy to Cloudflare Pages
```bash
pnpm run deploy
```

Or use a specified project name:
```bash
pnpm run cf:deploy
```

### Storybook Deployment

#### 1. Build Storybook
```bash
pnpm run storybook:build
```

#### 2. Local Preview Storybook
```bash
pnpm run storybook:preview
```

#### 3. Deploy Storybook to Cloudflare Pages
```bash
pnpm run storybook:deploy
```

Or use a specified project name:
```bash
pnpm run storybook:cf:deploy
```

## Configuration

### Documentation Site Configuration
- Project is configured for static export mode (`output: 'export'`)
- Image optimization is disabled for Cloudflare Pages compatibility
- Search functionality removed to simplify deployment

### Storybook Configuration
- Direct deployment of `storybook-static/` directory
- Configured with appropriate caching strategies and security headers
- No additional wrangler configuration file needed

### Build Artifacts
- Documentation site: `.vercel/output/static/` directory
- Storybook: `storybook-static/` directory
- All pages are pre-rendered as static HTML
- Supports client-side routing

## Deploy Both Projects Simultaneously

### Using One-Click Deployment Script
```bash
./deploy-all.sh
```

### Manual Deployment
```bash
# Deploy documentation site
pnpm run cf:deploy

# Deploy Storybook
pnpm run storybook:cf:deploy
```

## Environment Variables

If environment variables are needed, please add them in the Pages settings in Cloudflare Dashboard.

## Troubleshooting

1. **Build Failed**: Please check Next.js version compatibility
2. **Deployment Failed**: Please confirm you've logged in to Cloudflare correctly
3. **Page Loading Issues**: Please check static resource paths
4. **Need Search Functionality**: Please consider using client-side search solutions
5. **Storybook Build Failed**: Please check addon version compatibility
6. **Preview Command Error**: Ensure using correct command format, avoid using unsupported parameters

## Configuration Files

### Documentation Site
- `wrangler.toml`: Cloudflare Pages configuration
- `_headers`: HTTP headers configuration
- `next.config.mjs`: Next.js static export configuration

### Storybook
- `storybook-static/_headers`: Storybook HTTP headers configuration
- `.storybook/main.ts`: Storybook main configuration

## Access Deployed Sites

After successful deployment, you will get two URLs:
- Documentation site: `https://unify-docs.pages.dev`
- Storybook: `https://unify-storybook.pages.dev`

You can also view and manage these deployments in the Pages section of the Cloudflare Dashboard.

## Command Reference

### Documentation Site
```bash
pnpm run build              # Build Next.js application
pnpm run pages:build        # Build for Cloudflare Pages
pnpm run preview            # Local preview
pnpm run deploy             # Deploy
pnpm run cf:deploy          # Deploy to specified project
```

### Storybook
```bash
pnpm run storybook:build    # Build Storybook
pnpm run storybook:preview  # Local preview
pnpm run storybook:deploy   # Deploy
pnpm run storybook:cf:deploy # Deploy to specified project
``` 