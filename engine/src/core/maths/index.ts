import { float } from '../utils/types';

export { Vec2, Vec3, Vec4 } from './linearAlgebra/vector';
export { Mat } from './linearAlgebra/matrix';

export namespace Maths {
    export function isPowerOf2(value: number): boolean {
        return (value & (value - 1)) === 0;
    }
    export const EPSILON = 1e-9;

}

const _lut: string[] = [];
for (let i = 0; i < 256; i ++ ) {
    _lut[ i ] = ( i < 16 ? '0' : '' ) + ( i ).toString( 16 );

}

export function toRad(valueInDegrees: float): float {
    return valueInDegrees * Math.PI / 180;
}

export function clamp(value: number, min: number = 0.0, max: number = 1.0): number {
    return Math.max(min, Math.min(max, value));
}

export function uuid(): string {
    const d0 = Math.random() * 0xffffffff | 0;
    const d1 = Math.random() * 0xffffffff | 0;
    const d2 = Math.random() * 0xffffffff | 0;
    const d3 = Math.random() * 0xffffffff | 0;
    const uuid = _lut[ d0 & 0xff ] + _lut[ d0 >> 8 & 0xff ] + _lut[ d0 >> 16 & 0xff ] + _lut[ d0 >> 24 & 0xff ] + '-' +
        _lut[ d1 & 0xff ] + _lut[ d1 >> 8 & 0xff ] + '-' + _lut[ d1 >> 16 & 0x0f | 0x40 ] + _lut[ d1 >> 24 & 0xff ] + '-' +
        _lut[ d2 & 0x3f | 0x80 ] + _lut[ d2 >> 8 & 0xff ] + '-' + _lut[ d2 >> 16 & 0xff ] + _lut[ d2 >> 24 & 0xff ] +
        _lut[ d3 & 0xff ] + _lut[ d3 >> 8 & 0xff ] + _lut[ d3 >> 16 & 0xff ] + _lut[ d3 >> 24 & 0xff ];

    return uuid.toUpperCase();
}