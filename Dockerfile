# This Dockerfile is used to build a Node.js application image.
# It consists of multiple stages to optimize the build process and reduce image size.

ARG NODE_VERSION=20.10.0

# Stage 1: Base Image
# - Sets the working directory to /usr/src/app
# - Copies package.json and package-lock.json (if exists) to the working directory
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 3: Production
# - Uses the development stage as the starting point
# - Sets the NODE_ENV environment variable to production
# - Installs only production dependencies using npm ci
# - Changes ownership of the /usr/src/app/src and /usr/src/app/healthcheck directories to node:node
FROM node:18-alpine as production
ENV JWT_Token=3db489c8dfa4e552eb7f3528f1a91277229ec154b0098b46d441e53a6db5659b1442d9285a99b52a551e2c3ac63af9fbdd1d3e9d79e2ca7d8f69381860d20cbb
ENV NODE_ENV=production
ENV FRONTEND_DOMAIN_NAME=
ENV BACKEND_DOMAIN_NAME=/api
ENV GITHUB_API_Access_Token=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
ENV JENKINS_URL=http://localhost:8080
ENV GITHUB_CLIENT_ID=Ov23liWKtSxfBu7o8NUQ
ENV GITHUB_CLIENT_SECRET=134674f77893700a8f56bc0ed8b088296f7d01ce
ENV NUVVAIEMAIL=nuvvai.team@gmail.com
ENV NUVVAIPASSWORD=bpncurlmqlqmwbfq
WORKDIR /usr/src/app/src
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/dist/src ./
COPY --chown=node:node . .
USER node

# Exposes port 3000 for the application
EXPOSE 5000

# Sets the default command to run the production server
CMD [ "node", "server.js" ]
