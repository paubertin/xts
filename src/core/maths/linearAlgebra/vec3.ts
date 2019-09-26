import { float, int } from "src/core/utils/types";
import { Vec2 } from './vec2';
import { Logger } from "src/core/utils/log";

export class Vec3 {
    private _data: Float32Array;

    constructor();
    constructor(vec: Vec2, z: float);
    constructor(array: [float, float, float]);
    constructor(x: float, y: float, z: float);
    constructor(x?: float | [float, float, float] | Vec2, y?: float, z?: float) {
        if (Array.isArray(x)) {
            this._data = new Float32Array(x);
        }
        else if (x === undefined) {
            this._data = new Float32Array(3);
        }
        else if (x instanceof Vec2) {
            this._data = new Float32Array([x.x, x.y, <float>y]);
        }
        else {
            this._data = new Float32Array([x, <float>y, <float>z]);
        }
    }

    public toArray(): float[] {
        return [this.x, this.y, this.z];
    }

    public add(vec: Vec3): Vec3 {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        return this;
    }

    public static Add(v: Vec3, w: Vec3): Vec3 {
        let res = v.clone();
        res.add(w);
        return res;
    }

    public sub(vec: Vec3): Vec3 {
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        return this;
    }

    public static Sub(v: Vec3, w: Vec3): Vec3 {
        let res = v.clone();
        res.sub(w);
        return res;
    }

    public normalized(): Vec3 {
        const norm = this.norm;
        Logger.assert(norm > 0, 'The Vec3 has a 0 norm....');
        this.x /= norm;
        this.y /= norm;
        this.z /= norm;
        return this;
    }

    public cross(v: Vec3): Vec3 {
        const tmp = Vec3.Cross(this, v);
        this.x = tmp.x;
        this.y = tmp.y;
        this.z = tmp.z;
        return this;
    }

    public static Cross(v: Vec3, w: Vec3): Vec3 {
        return new Vec3(
            v.y * w.z - v.z * w.y,
            v.z * w.x - v.x * w.z,
            v.x * w.y - v.y * w.x
        );
    }

    public get norm(): float {
        return Math.sqrt(this.sqNorm);
    }

    public get sqNorm(): float {
        return this.x  * this.x + this.y * this.y + this.z * this.z;
    }

    public mult(scalar: float): Vec3 {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    public clone(): Vec3 {
        return new Vec3(this.x, this.y, this.z);
    }

    public get size(): int {
        return 3;
    }

    public get length(): int {
        return 3;
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

    public set x(x: float) {
        this._data[0] = x;
    }

    public set y(y: float) {
        this._data[1] = y;
    }

    public set z(z: float) {
        this._data[2] = z;
    }

    public at(i: int): float {
        return this._data[i];
    }

    public set(i: int, val: float): void {
        this._data[i] = val;
    }

    public static get X(): Vec3 {
        return new Vec3(1, 0, 0);
    }

    public static get Y(): Vec3 {
        return new Vec3(0, 1, 0);
    }

    public static get Z(): Vec3 {
        return new Vec3(0, 0, 1);
    }
}