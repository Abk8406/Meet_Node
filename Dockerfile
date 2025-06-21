# Dockerfile (backend)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Expose backend port
EXPOSE 3000

# Run the app using index.js
CMD ["node", "index.js"]
