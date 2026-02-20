# Backend Dockerfile for Render deployment
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy root workspace configuration
COPY package*.json ./

# Copy all packages
COPY packages ./packages
COPY tsconfig.base.json ./

# Install all workspace dependencies from root
RUN npm install

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build backend
WORKDIR /app/packages/backend
RUN npx prisma generate
RUN rm -rf dist && npm run build
# Verify build output exists
RUN ls -la dist/src/server.js

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/packages/backend/package*.json ./

# Copy built application (tsc outputs src/ files to dist/src/ due to rootDir: "./")
COPY --from=builder /app/packages/backend/dist ./dist

# Copy node_modules (includes all dependencies)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./node_modules/@dental-clinic/shared
COPY --from=builder /app/packages/backend/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma files for runtime
COPY --from=builder /app/packages/backend/prisma ./prisma
COPY --from=builder /app/packages/backend/prisma.config.ts ./prisma.config.ts

# Create symlink so relative imports from dist/src/ resolve node_modules correctly
# (dist/src/lib/prisma.js imports ../../node_modules/.prisma/client → dist/node_modules → /app/node_modules)
RUN ln -s /app/node_modules /app/dist/node_modules

# Install tsx for ESM module resolution (handles extensionless imports)
RUN npm install -g tsx

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command - use tsx to handle ESM extensionless imports
# tsc outputs src/ files to dist/src/ because rootDir is "./"
CMD ["tsx", "dist/src/server.js"]
