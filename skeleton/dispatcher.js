import { decodeRequest, encodeResponse } from '../protocol/codec.js';

const skeletons = new Map();

export function register(className, skeleton) {
    skeletons.set(className, skeleton);
}

export function handle(frame) {
    const { className } = decodeRequest(frame);
    const skeleton = skeletons.get(className);
    if (!skeleton) {
        return encodeResponse(false, `Unknown class: ${className}`);
    }
    return skeleton.handle(frame);
}

export default { register, handle };
