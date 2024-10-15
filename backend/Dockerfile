# Stage 1: Build the Node.js app (dependencies)
FROM public.ecr.aws/docker/library/node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the application source code
COPY . .

# Stage 2: Create the production image with minimal footprint
FROM public.ecr.aws/docker/library/node:20-alpine

# Set working directory for the final image
WORKDIR /app

# Copy only the necessary files from the build stage (dependencies and built app)
COPY --from=build /app /app

# Expose the port your application listens on
EXPOSE 4000

# Start the application with migrations
CMD ["sh", "-c", "npx prisma generate && npm start"]
