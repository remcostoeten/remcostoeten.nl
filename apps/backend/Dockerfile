# Use the official Bun image
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies in a separate layer
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json /temp/dev/
RUN cd /temp/dev && bun install

# Install production dependencies
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && bun install --production

# Build the application
FROM base AS builder
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Final stage - production image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Copy any additional config files if needed
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Set environment to production
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 4001

# Run the application
USER bun
ENTRYPOINT [ "bun", "run", "src/index.ts" ]