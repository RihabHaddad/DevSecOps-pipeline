FROM node:18-alpine
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libtool \
    autoconf \
    automake \
    nasm \
    pkgconfig \
    lz4 \
    zlib \
    openssl-dev \
    librdkafka-dev
WORKDIR /app
COPY package*.json ./
RUN rm -rf node_modules && npm cache clean --force
RUN npm install --build-from-source
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
