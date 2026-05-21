export function encodeRequest(className, op, args) {
    return `${className}|${op}|${args.join('|')}\n`;
}

export function decodeRequest(frame) {
    const parts = frame.trim().split('|');
    const [className, op, ...rest] = parts;
    return { className, op, args: rest.map(Number) };
}

export function encodeResponse(ok, value) {
    return ok ? `OK|${value}\n` : `ERR|${value}\n`;
}

export function decodeResponse(frame) {
    const trimmed = frame.trim();
    if (trimmed.startsWith('OK|')) {
        return { ok: true, value: Number(trimmed.slice(3)) };
    }
    return { ok: false, error: trimmed.slice(4) };
}
