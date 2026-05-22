import Calculator from '../bo/calculator.js';
import { decodeRequest, encodeResponse } from '../protocol/codec.js';
import { register } from './dispatcher.js';

const calculator = new Calculator();

function handle(frame) {
    const { op, args } = decodeRequest(frame);
    const [a, b] = args;
    try {
        switch (op) {
            case 'add':      return encodeResponse(true, calculator.add(a, b));
            case 'subtract': return encodeResponse(true, calculator.subtract(a, b));
            case 'multiply': return encodeResponse(true, calculator.multiply(a, b));
            case 'divide':   return encodeResponse(true, calculator.divide(a, b));
            default:         return encodeResponse(false, `Unknown op: ${op}`);
        }
    } catch (err) {
        return encodeResponse(false, err.message);
    }
}

const calculatorSkeleton = { handle };

register('calculator', calculatorSkeleton);

export default calculatorSkeleton;
