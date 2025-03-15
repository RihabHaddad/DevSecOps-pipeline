FROM node:18-alpine
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash \
    libtool \
    autoconf \
    automake \
    nasm \
    pkgconfig \
    lz4 \
    zlib \
    openssl-dev \
    librdkafka-dev \
    alpine-sdk
WORKDIR /app
COPY package*.json ./
RUN rm -rf node_modules package-lock.json && npm cache clean --force
RUN npm install --build-from-source --legacy-peer-deps
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
