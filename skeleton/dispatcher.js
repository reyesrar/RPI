import { pathToFileURL } from 'url';
import path from 'path';
import { decodeRequest, encodeResponse } from '../protocol/codec.js';

const skeletons = new Map();
const boInstances = new Map();

async function loadClass(className) {
    if (boInstances.has(className)) {
        return boInstances.get(className);
    }
    
    try {
        console.log(`Loading class: ${className}`);
        const modulePath = path.join(process.cwd(), 'bo', `${className}.js`);
        const moduleURL = pathToFileURL(modulePath).href;
        const module = await import(moduleURL);
        const ClassConstructor = module.default;
        
        const instance = Reflect.construct(ClassConstructor, []);
        
        const skeleton = {
            handle(request) {
                try {
                    const { method, params } = decodeRequest(request);
                    console.log(`Invoking: ${className}.${method}(${params.join(', ')})`);
                    
                    const methodFn = Reflect.get(instance, method);
                    
                    if (typeof methodFn !== 'function') {
                        return encodeResponse(false, `Method ${method} not found`);
                    }
                    
                    const result = Reflect.apply(methodFn, instance, params);
                    console.log(`Result: ${result}`);
                    
                    return encodeResponse(true, result);
                    
                } catch (err) {
                    console.error(`Error in ${className}.${method}:`, err.message);
                    return encodeResponse(false, err.message);
                }
            }
        };
        
        boInstances.set(className, instance);
        skeletons.set(className, skeleton);
        
        console.log(`Class ${className} loaded successfully`);
        return instance;
        
    } catch (error) {
        console.error(`Failed to load class ${className}:`, error.message);
        throw new Error(`Class ${className} not found: ${error.message}`);
    }
}

export async function handle(request) {
    try {
        const { className } = decodeRequest(request);
        
        if (!skeletons.has(className)) {
            await loadClass(className);
        }
        
        const skeleton = skeletons.get(className);
        return skeleton.handle(request);
        
    } catch (err) {
        return encodeResponse(false, err.message);
    }
}

export default { handle };