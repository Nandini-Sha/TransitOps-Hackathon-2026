FROM node:20-alpine

# Install OpenSSL which is required by Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the TypeScript code
RUN npm run build

EXPOSE 4000

# Start command: we also run pending migrations automatically before starting
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
