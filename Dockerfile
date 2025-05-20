# Use an official Node.js image as the base
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Set environment variables (optional — typically passed in at runtime)
# ENV DB_HOST=localhost
# ENV DB_PORT=5432
# ENV AWS_REGION=us-east-1

# Expose application port (default NestJS port is 3000)
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]