FROM public.ecr.aws/nginx/nginx:stable-alpine

# Copy custom NGINX config file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8080 instead of 80 (to avoid root privileges)
EXPOSE 80
# Command to start NGINX with a custom PID path
CMD ["nginx", "-g", "daemon off;"]