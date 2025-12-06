# 1️⃣ Use official Node image
FROM node:20-bullseye-slim AS deps

# Install dependencies
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* ./
RUN npm install

# 2️⃣ Build the application
FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Copy environment variables
ARG GROQ_API_KEY
ENV GROQ_API_KEY=$GROQ_API_KEY

RUN npm run build

# 3️⃣ Production image
FROM node:20-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy build files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]