import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { Router } from './router/router';

import { authMiddleware } from './middlewares/auth.middleware';
import { errorHandler } from './middlewares/error.handler';
import { logger } from './utils/logger';
import {productRoutes} from "./routes/product.route";
import {userRoutes} from "./routes/user.route";

const PORT = 3000;
const HTTPS_PORT = 3443;

// Create router instance
const router = new Router();

// Apply global middleware
router.use(logger);

// Register controller
router.use('/api/users', userRoutes);
router.use('/api/v1/products', authMiddleware, productRoutes);

// Basic homepage route
router.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>HTTP Server Project</title>
    </head>
    <body>
        <h1>Hello World</h1>
        <h2>Test Form</h2>
        <form action="/api/users/" method="POST" enctype="application/x-www-form-urlencoded">
            <input type="text" name="name" placeholder="Name" required>
            <input type="email" name="email" placeholder="Email" required>
            <button type="submit">Submit</button>
        </form>
        
        <h2>File Upload Form</h2>
        <form action="/api/upload" method="POST" enctype="multipart/form-data">
            <input type="file" name="file" required>
            <button type="submit">Upload</button>
        </form>
    </body>
    </html>
  `);
});

// File upload route
router.post('/api/upload', (req, res) => {
    // This will be handled by the multipart middleware in the router
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'File uploaded successfully' }));
});

// Apply error handler
router.use(errorHandler);

// Create HTTP server
const server = http.createServer((req, res) => {
    // Log each request
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Handle request with router
    router.handle(req, res);
});

// Create HTTPS server with self-signed certificate
const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../certs/server.key')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/server.crt'))
};

const httpsServer = https.createServer(httpsOptions, (req, res) => {
    console.log(`${new Date().toISOString()} - HTTPS ${req.method} ${req.url}`);
    router.handle(req, res);
});

// Start servers
server.listen(PORT, () => {
    console.log(`HTTP Server running on http://localhost:${PORT}`);
});

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on https://localhost:${HTTPS_PORT}`);
});

export { server, httpsServer };