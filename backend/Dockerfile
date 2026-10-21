FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY prisma.config.ts ./
COPY prisma ./prisma
COPY src/config/load-env.js ./src/config/load-env.js
RUN npm run prisma:generate

COPY src ./src
ENV NODE_ENV=production
EXPOSE 5100

CMD ["sh", "-c", "npm run prisma:deploy && npm start"]
