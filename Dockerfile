# ─────────────────────────────────────────────
# Stage 1: Build the React frontend
# ─────────────────────────────────────────────
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy root package files and install frontend deps
COPY package*.json ./
RUN npm ci

# Copy frontend source and build
COPY index.html vite.config.js ./
COPY src/ ./src/
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Production image with Express backend
# ─────────────────────────────────────────────
FROM node:18-alpine AS production

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/dist ./dist

# Copy server source
COPY server/ ./server/

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose the backend port
EXPOSE 5000

# Health check — verifies the API is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start the Express server (which also serves the built frontend)
CMD ["node", "server/index.js"]
