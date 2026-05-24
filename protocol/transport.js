export function readRequest(socket, onReq) {
    let buffer = '';
    socket.on('data', (chunk) => {
        buffer += chunk.toString();
        let newline;
        while ((newline = buffer.indexOf('\n')) !== -1) {
            const req = buffer.slice(0, newline + 1);
            buffer = buffer.slice(newline + 1);
            onReq(req);
        }
    });
}
