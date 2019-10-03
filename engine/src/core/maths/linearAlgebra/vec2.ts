import { ILength } from "src/core/interfaces";
import { int, float } from "src/core/utils/types";
import { GLfloat2 } from "src/core/utils/tuples";

export class Vec2 {
    private _data: Float32Array;
    
    constructor();
    constructor(array: [float, float]);
    constructor(x: float, y: float);
    constructor(x?: float | [float, float], y?: float) {
        if (Array.isArray(x)) {
            this._data = new Float32Array(x);
        }
        else if (x === undefined) {
            this._data = new Float32Array(2);
        }
        else {
            this._data = new Float32Array([x, <float>y]);
        }
    }

    public from(vec: Vec2): Vec2;
    public from(x: float, y: float): Vec2;
    public from(x: float | Vec2, y?: float): Vec2 {
        if (x instanceof Vec2) {
            this.x = x.x;
            this.y = x.y;
        }
        else {
            this.x = x;
            this.y = y!;
        }
        return this;
    }

    public toArray(): [float, float] {
        return [this.x, this.y];
    }

    public clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    public get size(): int {
        return 2;
    }

    public get length(): int {
        return 2;
    }


    public get x(): float {
        return this._data[0];
    }

    public get y(): float {
        return this._data[1];
    }

    public set x(x: float) {
        this._data[0] = x;
    }

    public set y(y: float) {
        this._data[1] = y;
    }

    public at(i: int): float {
        return this._data[i];
    }

    public set(i: int, val: float): void {
        this._data[i] = val;
    }

    public clamp(min: GLfloat, max: GLfloat): Vec2;
    public clamp(min: GLfloat2, max: GLfloat2): Vec2;
    public clamp(min: GLfloat | GLfloat2, max: GLfloat | GLfloat2): Vec2 {
        if (typeof min === 'number' && typeof max === 'number') {
            this._data[0] = Math.max(min, Math.min(max, this._data[0]));
            this._data[1] = Math.max(min, Math.min(max, this._data[1]));
        }
        else if (Array.isArray(min) && Array.isArray(max)) {
            this._data[0] = Math.max(min[0], Math.min(max[0], this._data[0]));
            this._data[1] = Math.max(min[1], Math.min(max[1], this._data[1]));
        }
        return this;
    }

    public static clamp(vec: Vec2 | GLfloat2, min: GLfloat, max: GLfloat): Vec2;
    public static clamp(vec: Vec2 | GLfloat2, min: GLfloat2, max: GLfloat2): Vec2;
    public static clamp(vec: Vec2 | GLfloat2, min: GLfloat | GLfloat2, max: GLfloat | GLfloat2): Vec2 {
        let out: Vec2;

        if (vec instanceof Vec2) out = vec.clone();
        else out = new Vec2(vec[0], vec[1]);

        if (typeof min === 'number') out.clamp(min, <GLfloat>max);
        else out.clamp(min, <GLfloat2>max);
        return out;
    }

    public mult(vec: GLfloat2): Vec2;
    public mult(vec: Vec2): Vec2;
    public mult(scalar: float): Vec2;
    public mult(scalar: float | Vec2 | GLfloat2): Vec2 {
        if (typeof scalar === 'number') {
            this.x *= scalar;
            this.y *= scalar;
        }
        else if (scalar instanceof Vec2) {
            this.x *= scalar.x;
            this.y *= scalar.y;
        }
        else {
            this.x *= scalar[0];
            this.y *= scalar[1];
        }
        return this;
    }

    public static mult(v: Vec2, vec: GLfloat2): Vec2;
    public static mult(v: Vec2, vec: Vec2): Vec2;
    public static mult(v: Vec2, scalar: float): Vec2;
    public static mult(v: Vec2, scalar: float | Vec2 | GLfloat2): Vec2 {
        let out = v.clone();
        return out.mult(scalar as any);
    }

    public div(scalar: float): Vec2;
    public div(v: GLfloat2): Vec2;
    public div(v: Vec2): Vec2;
    public div(v: float | Vec2 | GLfloat2): Vec2 {
        if (typeof v === 'number') {
            this.x /= v;
            this.y /= v;
        }
        else if (v instanceof Vec2) {
            this.x /= v.x;
            this.y /= v.y;
        }
        else {
            this.x /= v[0];
            this.y /= v[1];
        }
        return this;
    }

    public static div(v: Vec2, scalar: float): Vec2;
    public static div(v: Vec2, w: Vec2): Vec2;
    public static div(v: Vec2, w: GLfloat2): Vec2;
    public static div(v: Vec2, w: float | Vec2 | GLfloat2): Vec2 {
        let out = v.clone();
        return out.div(w as any);
    }

    public max(v: Vec2): Vec2;
    public max(v: GLfloat2): Vec2;
    public max(v: Vec2 | GLfloat2): Vec2 {
        if (v instanceof Vec2) {
            this.x = Math.max(this.x, v.x);
            this.y = Math.max(this.y, v.y);
        }
        else {
            this.x = Math.max(this.x, v[0]);
            this.y = Math.max(this.y, v[1]);
        }
        return this;
    }

    public static max(v: Vec2, w: Vec2): Vec2 {
        let out = v.clone();
        return out.max(w);
    }

    public round(): Vec2 {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    public static round(v: Vec2): Vec2 {
        let out = v.clone();
        return out.round();
    }

    public static get Zero(): Vec2 {
        return new Vec2();
    }

    public static get One(): Vec2 {
        return new Vec2(1, 1);
    }
}