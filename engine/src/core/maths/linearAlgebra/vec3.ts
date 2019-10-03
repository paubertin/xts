import { float, int } from "src/core/utils/types";
import { Vec2 } from './vec2';
import { Logger } from "src/core/utils/log";
import { Quaternion } from "./quaternion";
import { Mat } from "./matrix";

export class Vec3 {
    private _data: Float32Array;

    private static tmpMatrix: Mat = new Mat();

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

    public toString(): string {
        return `[${this.x}\t${this.y}\t${this.z}]`;
    }

    public display(message?: string): void {
        console.log(message ? message + '\n' + this.toString() : this.toString());
    }

    public static get Zeros(): Vec3 {
        return new Vec3(0, 0, 0);
    }

    public equals(v: Vec3): boolean {
        return this.x === v.x && this.y === v.y && this.z === v.z;
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

    public static Add(v: Vec3, w: Vec3, out?: Vec3): Vec3 {
        if (out) {
            out.x = v.x + w.x;
            out.y = v.y + w.y;
            out.z = v.z + w.z;
            return out;
        }
        else {
            return new Vec3(v.x + w.x, v.y + w.y, v.z + w.z);
        }
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
        return this.from(Vec3.Cross(this, v));
    }

    public static Cross(v: Vec3, w: Vec3): Vec3 {
        return new Vec3(
            v.y * w.z - v.z * w.y,
            v.z * w.x - v.x * w.z,
            v.x * w.y - v.y * w.x
        );
    }

    public dot(v: Vec3): float {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    public get norm(): float {
        return Math.sqrt(this.sqNorm);
    }

    public get sqNorm(): float {
        return this.x  * this.x + this.y * this.y + this.z * this.z;
    }

    public mult(vec: Vec3): Vec3
    public mult(scalar: float): Vec3;
    public mult(v: float | Vec3): Vec3 {
        if (v instanceof Vec3) {
            this.x *= v.x;
            this.y *= v.y;
            this.z *= v.z;
        }
        else {
            this.x *= v;
            this.y *= v;
            this.z *= v;
        }
        return this;
    }

    public clone(): Vec3 {
        return new Vec3(this.x, this.y, this.z);
    }

    public negate(): Vec3 {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    public from(x: float, y: float, z: float): Vec3
    public from(vec: Vec3): Vec3;
    public from(vec: Vec3 | float, y?: float, z?: float): Vec3 {
        if (vec instanceof Vec3) {
            this.x = vec.x;
            this.y = vec.y;
            this.z = vec.z;
        }
        else {
            this.x = vec;
            this.y = y!;
            this.z = z!;
        }
        return this;
    }

    public get size(): int {
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

    public static RotateByQuaternion(vec: Vec3, quat: Quaternion, out?: Vec3): Vec3 {
        this.tmpMatrix.from(quat);
        return Mat.TransformCoordinates(this.tmpMatrix, vec, out);
    }
}