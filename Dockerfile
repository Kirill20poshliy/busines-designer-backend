FROM node:alpine AS builder

WORKDIR /usr/app/backend

COPY package*.json ./

RUN npm ci

COPY . /usr/app/backend

RUN npm run build

FROM node:alpine

WORKDIR /usr/app/backend

COPY --from=builder /usr/app/backend .

RUN mkdir -p /usr/app/backend/uploads

EXPOSE 8080

CMD ["node", "dist/app.js"]
# CMD ["sh", "-c", "npm run node dist/app.js && migrate:prod"]