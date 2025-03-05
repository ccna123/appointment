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

# Install curl
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && chmod +x kubectl \
    && mv kubectl /usr/local/bin/

# Set working directory for the final image
WORKDIR /express

# Copy only the necessary files from the build stage (dependencies and built app)
COPY --from=build /express /express
# Check if kind-config.yaml exists, copy it if available
RUN mkdir -p /root/.kube && \
    cd /root/.kube && \
    touch config && \
    ls -la /express && \
    if [ -f /express/kind-config.yaml ]; then \
    cp /express/kind-config.yaml /root/.kube/config; \
    else \
    echo "kind-config.yaml not found, skipping config copy"; \
    fi

# Expose the port your application listens on
EXPOSE 4030

# Start the application with migrations
CMD ["sh", "-c", "npm start"]
