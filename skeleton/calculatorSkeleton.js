import Calculator from '../bo/calculator.js';
import { decodeRequest, encodeResponse } from '../protocol/codec.js';

const calculator = new Calculator();

function handle(request) {
    try {
        const { method, params } = decodeRequest(request);
        
        // Get method from calculator instance
        const methodFn = Reflect.get(calculator, method);
        
        if (typeof methodFn !== 'function') {
            return encodeResponse(false, `Method ${method} not found`);
        }
        
        // Uses reflexion to invoke method with variable params
        const result = Reflect.apply(methodFn, calculator, params);
        
        return encodeResponse(true, result);
        
    } catch (err) {
        return encodeResponse(false, err.message);
    }
}

const calculatorSkeleton = { handle };

export default calculatorSkeleton;