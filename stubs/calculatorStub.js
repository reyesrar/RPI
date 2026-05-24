import net from 'net';
import { encodeRequest, decodeResponse } from '../protocol/codec.js';
import { readRequest } from '../protocol/transport.js';

// Uses Proxy to intercept any method call
class CalculatorStub {
    constructor(host = 'localhost', port = 3000) {
        this.host = host;
        this.port = port;
        this.className = 'calculator';
        
        // Return a Proxy that intercepts all method calls
        return new Proxy(this, {
            get(target, method) {
                if (method === 'host' || method === 'port' || method === 'className') {
                    return target[method];
                }
                
                if (typeof method === 'string') {
                    return function(...args) {
                        return target._invoke(method, args);
                    };
                }
                
                return target[method];
            }
        });
    }

    _invoke(method, params) {
        return new Promise((resolve, reject) => {
            const socket = net.createConnection(this.port, this.host, () => {
                socket.write(encodeRequest(this.className, method, params));
            });

            readRequest(socket, (request) => {
                const response = decodeResponse(request);
                socket.end();
                
                if (response.success) {
                    resolve(response.result);
                } else {
                    reject(new Error(response.error));
                }
            });

            socket.on('error', (err) => reject(err));
        });
    }
}

export default CalculatorStub;