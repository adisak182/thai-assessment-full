# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Backend & Runtime
FROM node:20-alpine
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server code
COPY server ./server

# Copy built frontend assets from stage 1 to dist
COPY --from=frontend-builder /app/dist ./dist

# Environment settings
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

WORKDIR /app/server
CMD ["node", "server.js"]
