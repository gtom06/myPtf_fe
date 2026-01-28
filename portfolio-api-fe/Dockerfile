# Use official Node.js image as the base
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json first (for better cache)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code (including src and public)
COPY . .

# Build the React app
RUN npm run build

FROM nginx:alpine

# Copy dist output (Webpack) to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
