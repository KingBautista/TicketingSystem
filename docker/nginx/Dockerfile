FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# Create health check endpoint
RUN echo 'server { listen 80; location /health { access_log off; return 200 "healthy\n"; add_header Content-Type text/plain; } }' > /etc/nginx/conf.d/health.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
