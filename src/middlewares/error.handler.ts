import { Request, Response, Middleware } from '../router/router';

export const errorHandler: Middleware = (req: Request, res: Response, next?: () => void) => {
    // This middleware will catch any unhandled errors
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    });

    next?.();
};