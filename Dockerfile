# This Dockerfile is used to build a Node.js application image.
# It consists of multiple stages to optimize the build process and reduce image size.

ARG NODE_VERSION=20.10.0

# Stage 1: Base Image
# - Sets the working directory to /usr/src/app
# - Copies package.json and package-lock.json (if exists) to the working directory
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app
COPY package*.json .

# Stage 2: Dependencies
# - Uses the baseImage as the starting point
# - Installs project dependencies using npm
# - Utilizes Docker build cache for faster builds
FROM base AS dependencies
RUN npm install

# Stage 3: Development
# - Uses the dependencies stage as the starting point
# - Copies the entire project to the working directory
# - Sets the default command to run the development server
FROM dependencies AS development
COPY ./dist/src .

# Stage 4: Production
# - Uses the development stage as the starting point
# - Sets the NODE_ENV environment variable to production
# - Installs only production dependencies using npm ci
# - Changes ownership of the /usr/src/app/src and /usr/src/app/healthcheck directories to node:node
FROM development as production
#change at the production stage...
ENV JWT_Token 3db489c8dfa4e552eb7f3528f1a91277229ec154b0098b46d441e53a6db5659b1442d9285a99b52a551e2c3ac63af9fbdd1d3e9d79e2ca7d8f69381860d20cbb
ENV NODE_ENV production
RUN npm ci --only=production
USER node
COPY --chown=node:node . .

# Exposes port 3000 for the application
EXPOSE 5000

# Sets the default command to run the production server
CMD [ "node", "app.js" ]
