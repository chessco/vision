FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma/mysql-client ./node_modules/@prisma/mysql-client
COPY --from=builder /app/node_modules/@prisma/postgres-client ./node_modules/@prisma/postgres-client
COPY --from=builder /app/prisma ./prisma
EXPOSE 3016
CMD ["node", "dist/main"]
