FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for Playwright
RUN apk add --no-cache chromium

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy project files
COPY . .

# Install dependencies
RUN pnpm install

# Set environment variables
ENV NODE_ENV production
ENV NEXT_PUBLIC_WEBSITE_URL https://playground.uni-labs.org

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start command
CMD ["pnpm", "start"]