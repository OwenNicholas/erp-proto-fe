# Use Node.js image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Use a lightweight image for serving
FROM node:18-alpine

WORKDIR /app

# Copy built files from the builder
COPY --from=builder /app ./

EXPOSE 3500

# Start Next.js
CMD ["npm", "start"]
