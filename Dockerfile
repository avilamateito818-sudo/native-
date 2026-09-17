FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server ./server
COPY css ./css
COPY js ./js
COPY images ./images
COPY index.html ./index.html
COPY labiales.html ./labiales.html
COPY maquillaje.html ./maquillaje.html
COPY cremas.html ./cremas.html
COPY mascarillas.html ./mascarillas.html
COPY corporal.html ./corporal.html
COPY fragancias.html ./fragancias.html

ENV PORT=8080
EXPOSE 8080

WORKDIR /app/server
CMD ["node", "server.js"]