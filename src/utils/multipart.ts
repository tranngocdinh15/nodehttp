export function parseMultipart(body: string, contentType: string): any {
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
        return {};
    }

    const parts = body.split(`--${boundary}`);
    const result: any = {};

    for (const part of parts) {
        if (part.includes('Content-Disposition')) {
            const nameMatch = part.match(/name="([^"]+)"/);
            if (nameMatch) {
                const fieldName = nameMatch[1];
                const valueStart = part.indexOf('\r\n\r\n') + 4;
                const value = part.substring(valueStart).replace(/\r\n$/, '');
                result[fieldName] = value;
            }
        }
    }

    return result;
}