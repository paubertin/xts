import { float, int } from "src/core/utils/types";

export class Vec4 {
    private _data: Float32Array;
    
    constructor();
    constructor(array: [float, float, float, float]);
    constructor(x: float, y: float, z: float, t: float);
    constructor(x?: float | [float, float, float, float], y?: float, z?: float, t?: float) {
        if (Array.isArray(x)) {
            this._data = new Float32Array(x);
        }
        else if (x === undefined) {
            this._data = new Float32Array(4);
        }
        else {
            this._data = new Float32Array([x, <float>y, <float>z, <float>t]);
        }
    }

    public get size(): int {
        return 4;
    }

    public get length(): int {
        return 4;
    }


    public get x(): float {
        return this._data[0];
    }

    public get y(): float {
        return this._data[1];
    }

    public get z(): float {
        return this._data[2];
    }

    public get t(): float {
        return this._data[3];
    }

    public at(i: int): float {
        return this._data[i];
    }

    public set(i: int, val: float): void {
        this._data[i] = val;
    }
}