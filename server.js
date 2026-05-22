import net from 'net';
import { readFrames } from './protocol/transport.js';
import dispatcher from './skeleton/dispatcher.js';
import './skeleton/calculatorSkeleton.js';

const PORT = 3000;
const HOST = '0.0.0.0';

const server = net.createServer((socket) => {
    readFrames(socket, (frame) => {
        socket.write(dispatcher.handle(frame));
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err.message);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Server listening on ${PORT}`);
});
