FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy all backend source code
COPY . .

# Expose the port your backend runs on
EXPOSE 3001

# Start the Node.js server
CMD ["npm", "start"]
