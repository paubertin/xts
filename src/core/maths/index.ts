import { float } from '../utils/types';

export { Vec2, Vec3, Vec4 } from './linearAlgebra/vector';
export { Mat } from './linearAlgebra/matrix';

export namespace Maths {
    export function isPowerOf2(value: number): boolean {
        return (value & (value - 1)) === 0;
    }
    export const EPSILON = 1e-9;
}

export function toRad(valueInDegrees: float): float {
    return valueInDegrees * Math.PI / 180;
}

export function clamp(value: number, min: number = 0.0, max: number = 1.0): number {
    return Math.max(min, Math.min(max, value));
}