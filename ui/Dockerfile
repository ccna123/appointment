# Stage 1: Build the React app
FROM node:23-bookworm-slim AS build

# Set working directory
WORKDIR /react

# Copy and install only the production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the application source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: NGINX to serve the React app
FROM nginx:stable-alpine

# Copy the built React app from the build stage
COPY --from=build /react/build /usr/share/nginx/html

# Copy custom NGINX config file
COPY --from=build /react/nginx.conf /etc/nginx/nginx.conf

# add env.sh to docker-entrypoint.d
COPY --from=build /react/inject_env.sh /docker-entrypoint.d/inject_env.sh
RUN chmod +x /docker-entrypoint.d/inject_env.sh

EXPOSE 80
# Command to start NGINX with a custom PID path
CMD ["nginx", "-g", "daemon off;"]