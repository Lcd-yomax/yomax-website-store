# ─── Build Stage ──────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /build

# Install git (needed for Go modules)
RUN apk add --no-cache git

# Copy everything (source + go.mod)
COPY . .

# Download dependencies and generate go.sum
RUN go mod tidy

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /build/fixparts-sync ./cmd/server

# ─── Production Stage ─────────────────────────────
FROM alpine:3.19

WORKDIR /app

# Install ca-certificates for HTTPS calls to Odoo
RUN apk add --no-cache ca-certificates tzdata

# Copy binary from builder
COPY --from=builder /build/fixparts-sync /app/fixparts-sync

# Create image directory
RUN mkdir -p /app/images/products

# Expose port
EXPOSE 8080

# Run the service
CMD ["/app/fixparts-sync"]
