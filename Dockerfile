# ====== Stage 1: Build React App ======
FROM node:20 AS build
WORKDIR /app

# Copy package info and install deps
COPY package*.json ./
RUN npm install

# Copy project files and build
COPY . .
RUN npm run build


# ====== Stage 2: Serve with Nginx ======
FROM nginx:alpine

# Copy built frontend to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom nginx config (see below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose container port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
