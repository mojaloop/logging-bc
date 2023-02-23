########################################
FROM node:18.13-alpine as builder

# Create the project directory inside the container.
WORKDIR /app

RUN apk add --no-cache -t build-dependencies git make gcc g++ python3 libtool autoconf pkgconfig automake bash # wget tar xz

RUN cd $(npm root -g)/npm
RUN npm config set unsafe-perm true
RUN npm install -g node-gyp

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

COPY modules/public-types-lib/package.json ./modules/public-types-lib/
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
COPY modules/client-lib ./modules/client-lib
COPY modules/public-types-lib ./modules/public-types-lib

# copy service code
COPY modules/logging-svc ./modules/logging-svc

# build
RUN npm run build

########################################
FROM node:18.13-alpine
WORKDIR /app

COPY --from=builder /app .

# kafka handler, no http server yet
EXPOSE 3100

CMD [ "npm", "run", "start:logging-svc" ]
