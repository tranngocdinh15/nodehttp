import * as url from 'url';
import * as querystring from 'querystring';
import { IncomingMessage, ServerResponse } from 'http';
import { parseMultipart } from '../utils/multipart';

// Define interfaces that extend Node.js types
export interface Request extends IncomingMessage {
    query?: Record<string, string>;
    params?: Record<string, string>;
    body?: any;
}

export interface Response extends ServerResponse {
    status(code: number): Response;
    json(data: any): void;
}

export type Handler = (req: Request, res: Response, next?: () => void) => void;
export type Middleware = Handler;

interface Route {
    method: string;
    path: string;
    handler: Handler;
    params: string[];
}

// Adapter function to convert Node's ServerResponse to our custom Response
function adaptResponse(res: ServerResponse): Response {
    const adaptedRes = res as Response;

    if (!adaptedRes.json) {
        adaptedRes.json = function(data: any) {
            this.writeHead(200, { 'Content-Type': 'application/json' });
            this.end(JSON.stringify(data));
        };
    }

    if (!adaptedRes.status) {
        adaptedRes.status = function(code: number) {
            this.statusCode = code;
            return this;
        };
    }

    return adaptedRes;
}

// Adapter function to convert Node's IncomingMessage to our custom Request
function adaptRequest(req: IncomingMessage): Request {
    return req as Request;
}

export class Router {
    private routes: Route[] = [];
    private middlewares: Middleware[] = [];

    constructor() {
        // No need for binding as we're not using enhanceResponse anymore
    }

    private parseRoute(path: string): { pattern: RegExp; params: string[] } {
        const params: string[] = [];
        const pattern = path.replace(/:([^/]+)/g, (match, param) => {
            params.push(param);
            return '([^/]+)';
        });

        return {
            pattern: new RegExp(`^${pattern}$`),
            params
        };
    }

    private async parseBody(req: Request): Promise<void> {
        return new Promise((resolve) => {
            const contentType = req.headers['content-type'] as string || '';
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    if (contentType.includes('application/json')) {
                        req.body = JSON.parse(body);
                    } else if (contentType.includes('application/x-www-form-urlencoded')) {
                        req.body = querystring.parse(body);
                    } else if (contentType.includes('multipart/form-data')) {
                        req.body = parseMultipart(body, contentType);
                    } else {
                        req.body = body;
                    }
                } catch (error) {
                    req.body = body;
                }
                resolve();
            });
        });
    }

    use(pathOrMiddleware: string | Middleware, ...handlers: (Middleware | Router)[]): void {
        if (typeof pathOrMiddleware === 'function') {
            // Global middleware
            this.middlewares.push(pathOrMiddleware);
        } else {
            // Path-specific middleware or sub-router
            const basePath = pathOrMiddleware;
            handlers.forEach(handler => {
                if (handler instanceof Router) {
                    // Mount sub-router
                    handler.routes.forEach(route => {
                        this.routes.push({
                            ...route,
                            path: basePath + route.path
                        });
                    });
                    // Add sub-router middlewares
                    handler.middlewares.forEach(middleware => {
                        this.middlewares.push(middleware);
                    });
                } else {
                    // Path-specific middleware
                    this.middlewares.push((req, res, next) => {
                        if (req.url?.startsWith(basePath)) {
                            handler(req, res, next);
                        } else {
                            next?.();
                        }
                    });
                }
            });
        }
    }

    get(path: string, handler: Handler): void {
        this.addRoute('GET', path, handler);
    }

    post(path: string, handler: Handler): void {
        this.addRoute('POST', path, handler);
    }

    put(path: string, handler: Handler): void {
        this.addRoute('PUT', path, handler);
    }

    delete(path: string, handler: Handler): void {
        this.addRoute('DELETE', path, handler);
    }

    private addRoute(method: string, path: string, handler: Handler): void {
        const { params } = this.parseRoute(path);
        this.routes.push({
            method,
            path,
            handler,
            params
        });
    }

    async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const enhancedReq = adaptRequest(req);
        const enhancedRes = adaptResponse(res);

        // Parse URL and query parameters
        const parsedUrl = url.parse(enhancedReq.url || '', true);
        enhancedReq.query = parsedUrl.query as Record<string, string>;

        // Parse request body
        await this.parseBody(enhancedReq);

        // Execute middlewares
        let middlewareIndex = 0;
        const executeMiddleware = () => {
            if (middlewareIndex < this.middlewares.length) {
                const middleware = this.middlewares[middlewareIndex++];
                middleware(enhancedReq, enhancedRes, executeMiddleware);
            } else {
                this.executeRoute(enhancedReq, enhancedRes);
            }
        };

        executeMiddleware();
    }

    private executeRoute(req: Request, res: Response): void {
        const method = req.method || 'GET';
        let pathname = url.parse(req.url || '').pathname || '/';

        // Normalize path to always have trailing slash for consistency
        if (pathname.length > 1 && !pathname.endsWith('/')) {
            pathname += '/';
        }
        // Find matching route
        for (const route of this.routes) {
            if (route.method !== method) continue;

            const { pattern, params } = this.parseRoute(route.path);
            const match = pathname.match(pattern);

            if (match) {
                // Extract route parameters
                req.params = {};
                params.forEach((param, index) => {
                    if (req.params) {
                        req.params[param] = match[index + 1];
                    }
                });

                // Execute route handler
                try {
                    route.handler(req, res);
                    return;
                } catch (error) {
                    console.error('Route handler error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    return;
                }
            }
        }

        // No route found
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }

    register(method: string, path: string, handler: Handler): void {
        this.addRoute(method, path, handler);
    }
}