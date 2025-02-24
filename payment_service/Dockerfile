# Stage 1: Build the Node.js app (dependencies)
FROM node:23-bookworm-slim AS build

# Set working directory
WORKDIR /express


# Update npm to the latest version
RUN npm install -g npm@latest

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the application source code
COPY . .

# Stage 2: Create the production image with minimal footprint
FROM node:23-bookworm-slim

# Set working directory for the final image
WORKDIR /express

# Copy only the necessary files from the build stage (dependencies and built app)
COPY --from=build /express /express

# Expose the port your application listens on
EXPOSE 4000

# Start the application with migrations
CMD ["sh", "-c", "npm start"]
