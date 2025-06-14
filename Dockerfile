FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci 
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/package-lock.json ./ 

RUN npm ci --only=production && npm cache clean --force
CMD ["node", "dist/main"]
