# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy dependencies from the builder stage
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

# Copy compiled code and initial data from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/brands.json ./brands.json

# The command to run the application
CMD [ "npm", "start" ]
