# Dockerfile para Frontend React + Vite + TypeScript + Nginx

# Stage 1: Build da aplicação React
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Servidor Nginx em produção
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
