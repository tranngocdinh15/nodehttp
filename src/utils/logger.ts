import { Request, Response, Middleware } from '../router/router';

export const logger: Middleware = (req: Request, res: Response, next?: () => void) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);

    next?.();
};