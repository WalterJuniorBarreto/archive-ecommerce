# --- ETAPA 1: DEPS & BUILDER ---
FROM node:22.16-alpine AS builder
WORKDIR /app

# Copiamos solo los package.json para aprovechar caché
COPY package.json package-lock.json* ./

# Instalamos dependencias
RUN npm ci --verbose

# Copiamos el resto del código
COPY . .

# Build de Next.js
RUN npm run build


# --- ETAPA 2: RUNNER ---
FROM node:22.16-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiamos solo lo necesario
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
