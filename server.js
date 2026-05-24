import net from 'net';
import { readRequest } from './protocol/transport.js';
import dispatcher from './skeleton/dispatcher.js';

const PORT = 3000;
const HOST = '0.0.0.0';

const server = net.createServer((socket) => {
    console.log('Client connected:', socket.remoteAddress);
    
    readRequest(socket, async (request) => {
        console.log('Request:', request.trim());
        
        const response = await dispatcher.handle(request);
        
        console.log('Sending response:', response.trim());
        socket.write(response);
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err.message);
    });
    
    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Server listening on ${PORT}`);
});