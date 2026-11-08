FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY prisma.config.ts ./
COPY prisma ./prisma
COPY --chown=node:node src/config/load-env.js ./src/config/load-env.js
RUN npm run prisma:generate

COPY --chown=node:node src ./src
ENV NODE_ENV=production \
    HOME=/tmp \
    TMPDIR=/tmp

USER node

EXPOSE 5100

CMD ["node", "src/server.js"]
