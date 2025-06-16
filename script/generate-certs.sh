#!/bin/bash

# Create certs directory
mkdir -p certs

# Generate private key (2048-bit RSA)
openssl genrsa -out certs/server.key 2048

# Generate certificate signing request with your details
openssl req -new -key certs/server.key -out certs/server.csr -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=NodeAssignment-d/OU=Development/CN=localhost/emailAddress=d@example.com"

# Generate self-signed certificate valid for 1 year
openssl x509 -req -in certs/server.csr -signkey certs/server.key -out certs/server.crt -days 365 -extensions v3_req

# Clean up CSR file
rm certs/server.csr

echo "SSL certificates generated successfully!"
echo "Files created:"
echo "   - certs/server.key (Private Key)"
echo "   - certs/server.crt (Certificate)"
