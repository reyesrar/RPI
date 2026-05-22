import net from 'net';
import { encodeRequest, decodeResponse } from '../protocol/codec.js';
import { readFrames } from '../protocol/transport.js';

class CalculatorStub {
    constructor(host = 'localhost', port = 3000) {
        this.host = host;
        this.port = port;
    }

    _invoke(op, a, b) {
        return new Promise((resolve, reject) => {
            const socket = net.createConnection(this.port, this.host, () => {
                socket.write(encodeRequest('calculator', op, [a, b]));
            });

            readFrames(socket, (frame) => {
                const response = decodeResponse(frame);
                socket.end();
                if (response.ok) {
                    resolve(response.value);
                } else {
                    reject(new Error(response.error));
                }
            });

            socket.on('error', (err) => reject(err));
        });
    }

    add(a, b)      { return this._invoke('add', a, b); }
    subtract(a, b) { return this._invoke('subtract', a, b); }
    multiply(a, b) { return this._invoke('multiply', a, b); }
    divide(a, b)   { return this._invoke('divide', a, b); }
}

export default CalculatorStub;
