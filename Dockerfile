FROM node:18-alpine


RUN apk add --no-cache \
    bash \
    python3 \
    make \
    g++ \
    librdkafka-dev

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
