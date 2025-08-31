FROM node:18-alpine

# Install system dependencies for USB/Serial support
RUN apk add --no-cache \
    udev \
    eudev-dev \
    libusb-dev \
    linux-headers \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create udev rules for USB devices
RUN echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="0483", ATTR{idProduct}=="5740", MODE="0666"' > /etc/udev/rules.d/99-usb.rules

# Expose port
EXPOSE 3002

# Start the application
CMD ["node", "send-display.js"]
