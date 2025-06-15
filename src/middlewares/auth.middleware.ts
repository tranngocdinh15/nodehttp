import { Request, Response, Middleware } from '../router/router';

const VALID_API_KEYS = ['api-key-123', 'api-key-456'];

export const authMiddleware: Middleware = (req: Request, res: Response, next?: () => void) => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey || !VALID_API_KEYS.includes(apiKey)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized: Valid API key required' }));
        return;
    }

    next?.();
};