#!/bin/bash

# Create certs directory
mkdir -p certs

echo "🔐 Generating SSL certificates for ha370026..."
echo "📅 Date: 2025-06-14 16:43:09 UTC"

# Generate private key (2048-bit RSA)
openssl genrsa -out certs/server.key 2048

# Generate certificate signing request with your details
openssl req -new -key certs/server.key -out certs/server.csr -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=NodeAssignment-ha370026/OU=Development/CN=localhost/emailAddress=ha370026@example.com"

# Generate self-signed certificate valid for 1 year
openssl x509 -req -in certs/server.csr -signkey certs/server.key -out certs/server.crt -days 365 -extensions v3_req

# Clean up CSR file
rm certs/server.csr

echo "✅ SSL certificates generated successfully!"
echo "📁 Files created:"
echo "   - certs/server.key (Private Key)"
echo "   - certs/server.crt (Certificate)"
echo "
