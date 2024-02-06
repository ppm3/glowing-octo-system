FROM node:18-alpine AS builder

RUN apk add --no-cache \
    build-base \
    gcc \
    g++ \
    make

ARG BUILD_CONTEXT 

WORKDIR /usr/src/app

RUN echo "Building ${BUILD_CONTEXT}"
RUN echo "packages/${BUILD_CONTEXT}/package*.json"

COPY packages/${BUILD_CONTEXT}/package.json ./

RUN cat package.json
RUN rm -rf node_modules
RUN npm cache clean --force
RUN npm install

COPY packages/${BUILD_CONTEXT}/tsconfig.json ./
COPY packages/${BUILD_CONTEXT}/src ./src

RUN npm run build 

# Create a lightweight production image
FROM node:14 as production

WORKDIR /usr/src/app

# ARGs for environment variables
ARG API_PORT
ARG API_LOG_LEVEL
ARG API_X_API_KEY
ARG EXTERNAL_API_URL
ARG EXTERNAL_API_USERS_ENDPOINT
ARG EXTERNAL_API_ALBUMS_ENDPOINT
ARG EXTERNAL_API_PHOTOS_ENDPOINT
ARG LOCAL_CACHE_ENABLED
ARG LOCAL_CACHE_TTL
ARG LOCAL_CACHE_PATH
ARG NODE_ENV

# Set environment variables
ENV NODE_ENV ${NODE_ENV}
ENV API_PORT ${API_PORT}
ENV API_LOG_LEVEL ${API_LOG_LEVEL}
ENV API_X_API_KEY ${API_X_API_KEY}
ENV EXTERNAL_API_URL ${EXTERNAL_API_URL}
ENV EXTERNAL_API_USERS_ENDPOINT ${EXTERNAL_API_USERS_ENDPOINT}
ENV EXTERNAL_API_ALBUMS_ENDPOINT ${EXTERNAL_API_ALBUMS_ENDPOINT}
ENV EXTERNAL_API_PHOTOS_ENDPOINT ${EXTERNAL_API_PHOTOS_ENDPOINT}
ENV LOCAL_CACHE_ENABLED ${LOCAL_CACHE_ENABLED}
ENV LOCAL_CACHE_TTL ${LOCAL_CACHE_TTL}
ENV LOCAL_CACHE_PATH ${LOCAL_CACHE_PATH}

# Copy only compiled output and dependencies from builder stage
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE ${API_PORT}

# Start the application
CMD ["node", "build/server.js"] 
