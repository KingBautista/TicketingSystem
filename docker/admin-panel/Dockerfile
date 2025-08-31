FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle conflicts
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Expose port 4000
EXPOSE 4000

# Start development server
CMD ["npm", "run", "dev"]
