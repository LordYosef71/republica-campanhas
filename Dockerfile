FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY server.cjs engine.cjs data.cjs reference-data.json accounts.cjs storage.cjs ./
COPY public ./public
USER node
EXPOSE 10000
CMD ["node", "server.cjs"]
