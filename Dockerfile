# Dockerfile para Aplicação Unificada Regz (Frontend React + Backend Node.js Express)

# Stage 1: Build do Frontend React (Vite + TypeScript)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Build do Backend Node.js (TypeScript)
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

# Stage 3: Container de Produção Unificado
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY backend/package*.json ./
RUN npm ci --only=production

# Copiar build do backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copiar build do frontend para a pasta public servida pelo Express
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 4000

CMD ["node", "dist/index.js"]
