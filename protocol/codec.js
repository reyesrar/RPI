const SEPARATOR = '|';

export function encodeRequest(className, method, params) {
    const paramsStr = params.map(p => String(p)).join(SEPARATOR);
    return `${className}${SEPARATOR}${method}${SEPARATOR}${paramsStr}\n`;
}

export function decodeRequest(request) {
    const parts = request.trim().split(SEPARATOR);
    const [className, method, ...rest] = parts;
    
    const params = rest.map(p => {
        const num = Number(p);
        return isNaN(num) ? p : num;
    });
    
    return { className, method, params };
}

export function encodeResponse(success, value) {
    return success ? `OK${SEPARATOR}${value}\n` : `ERR${SEPARATOR}${value}\n`;
}

export function decodeResponse(request) {
    const trimmed = request.trim();
    if (trimmed.startsWith(`OK${SEPARATOR}`)) {
        const value = trimmed.slice(3);
        const num = Number(value);
        return { success: true, result: isNaN(num) ? value : num };
    }
    return { success: false, error: trimmed.slice(4) };
}