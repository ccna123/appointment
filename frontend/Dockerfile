# Stage 1: Build the React app
FROM public.ecr.aws/docker/library/node:20-alpine AS build

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
FROM public.ecr.aws/nginx/nginx:stable-alpine

# Copy the built React app from the build stage
COPY --from=build /react/build /usr/share/nginx/html

# Copy custom NGINX config file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8080 instead of 80 (to avoid root privileges)
EXPOSE 80
# Command to start NGINX with a custom PID path
CMD ["nginx", "-g", "daemon off;"]