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

# Stage 2: Install curl and kubectl
FROM node:23-bookworm-slim AS tools 

# Install curl
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && chmod +x kubectl \
    && mv kubectl /usr/local/bin/


# Stage 3: Production image with Distroless
FROM gcr.io/distroless/nodejs22-debian12

# Set working directory for the final image
WORKDIR /express

COPY --from=build /express /express
COPY --from=tools /usr/bin/curl /usr/bin/curl
COPY --from=tools /usr/local/bin/kubectl /usr/local/bin/kubectl

# It’s a form of metadata or documentation, indicating the port your application uses.
# This is a hint to the person running the container that they need to expose this port.
EXPOSE 4030

# Start the application with migrations
CMD ["index.js"]
