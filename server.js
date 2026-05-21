import net from 'net';
import { pathToFileURL } from 'url';
import path from 'path';

const PORT = 3000;
const HOST = '0.0.0.0';
const classInstances = new Map();

async function loadClass(className) {
    if (classInstances.has(className)) {
        return classInstances.get(className);
    }
    
    try {
        const modulePath = path.join(process.cwd(), `${className}.js`);
        const moduleURL = pathToFileURL(modulePath).href;
        const module = await import(moduleURL);
        const ClassConstructor = module.default;
        
        const instance = Reflect.construct(ClassConstructor, []);
        
        classInstances.set(className, instance);
        return instance;
    } catch (error) {
        throw new Error(`Class ${className} not found: ${error.message}`);
    }
}

const server = net.createServer((socket) => {
    console.log('Client connected:', socket.remoteAddress, socket.remotePort);
    
    socket.on('data', async (data) => {
        try {
            const request = JSON.parse(data.toString());
            const { className, method, params } = request;
            
            console.log('Received request:', {className, method, params});
            
            // Load class
            const instance = await loadClass(className);
            
            // Method lookup
            const methodFn = Reflect.get(instance, method);
            
            // Verify
            if (typeof methodFn !== 'function') {
                throw new Error(`Method ${method} not found in class ${className}`);
            }
            
            // Invoke
            const result = Reflect.apply(methodFn, instance, params);
            
            const response = {
                success: true,
                result: result
            };
            
            console.log('Sending response:', response);
            socket.write(JSON.stringify(response));
            
        } catch (error) {
            console.error('Error:', error.message);
            const response = {
                success: false,
                error: error.message
            };
            socket.write(JSON.stringify(response));
        }
    });
    
    socket.on('close', () => {
        console.log('Client disconnected');
    });
    
    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Server listening on ${PORT}`);
});