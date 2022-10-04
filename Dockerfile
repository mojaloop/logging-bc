########################################
FROM node:16.13-alpine as builder

# Create app directory
WORKDIR /app

# build requirements
RUN apk --no-cache add git
RUN apk add --no-cache -t build-dependencies make gcc g++ python3 libtool libressl-dev openssl-dev autoconf automake \
    && cd $(npm root -g)/npm \
    && npm config set unsafe-perm true \
    && npm install -g node-gyp

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

COPY modules/public-types-lib/package.json ./modules/public-types-lib/
# server uses the defaultLogger from the client lib
COPY modules/client-lib/package.json ./modules/client-lib/
COPY modules/logging-svc/package.json ./modules/logging-svc/

#RUN ls -la

# If you are building your code for production
#RUN npm ci --only=production
RUN npm install

########################################
# Copy code and build

# root tsconfig.json
COPY tsconfig.json ./

# copy required supporting modules/packages (only the private ones not published to npm)
COPY modules/public-types-lib ./modules/public-types-lib
COPY modules/client-lib ./modules/client-lib

# copy service code
COPY modules/logging-svc ./modules/logging-svc


#RUN ls -la
#RUN ls -la ./modules/public-types-lib
#RUN ls -la ./modules/logging-svc
#RUN ls -la ./node_modules/@mojaloop/

# build
RUN npm run build

########################################
FROM node:16.13-alpine
WORKDIR /app

COPY --from=builder /app .

# kafka handler, no http server yet
EXPOSE 3100

CMD [ "npm", "run", "start:logging-svc" ]
