# Stage 1: Build the Node.js app (dependencies)
FROM node:slim AS build

# Set working directory
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

RUN npm install -g npm@latest

RUN npm cache clean --force && \
    npm install --save-dev prisma@latest && \
    npm install @prisma/client@latest

RUN npm install --save-dev prisma@latest && npm install @prisma/client@latest


# Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the application source code
COPY . .

# Stage 2: Create the production image with minimal footprint
FROM node:slim

RUN apt-get update -y && apt-get install -y openssl

# Set working directory for the final image
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

RUN npm install -g npm@latest

RUN npm cache clean --force && \
    npm install --save-dev prisma@latest && \
    npm install @prisma/client@latest

RUN npm install --save-dev prisma@latest && npm install @prisma/client@latest

# Copy only the necessary files from the build stage (dependencies and built app)
COPY --from=build /app /app

# Expose the port your application listens on
EXPOSE 4000

# Start the application with migrations
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm start"]
