# Stage 1: Build the React application using Node
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Pass in the backend URL during the build step (so Vite can bake it into the static files)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app to the /dist folder
RUN npm run build

# Stage 2: Serve the static files using Nginx
FROM nginx:alpine

# Copy the built files from Stage 1 into Nginx's serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config for React Router fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
