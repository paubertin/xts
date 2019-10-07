import { Vec3, Vec4 } from "./vector";
import { float } from "src/core/utils/types";
import { Maths } from "..";
import { threadId } from "worker_threads";
import { Quaternion } from "./quaternion";

export class Mat {
    protected m!: Float32Array;

    protected static readonly IDENTITY = new Mat();

    constructor();
    constructor(value: float);
    constructor(array: ArrayLike<float>);
    constructor(mat: Mat);
    constructor(v?: float | ArrayLike<float> | Mat) {
        this.m = new Float32Array(16);
        if (v === undefined) {
            this.m.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        }
        else if (typeof v === 'number') {
            this.m.set([
                v, v, v, v,
                v, v, v, v,
                v, v, v, v,
                v, v, v, v
            ]);
        }
        else if (v instanceof Mat) {
            this.m.set(v.m);
        }
        else {
            this.m.set(v);
        }
    }

    public toString(): string {
        const m = this.m;
        let str = '';
        for (let i = 0; i < 4; ++i) {
            str += `${m[i * 4]} \t\t ${m[i * 4 + 1]} \t\t ${m[i * 4 + 2]} \t\t ${m[i * 4 + 3]} \n`;
        }
        return str;
    }

    public isIdentity(): boolean {
        const m = this.m;
        return m[0] === 1.0 && m[1] === 0.0 && m[2] === 0.0 && m[3] === 0.0 &&
            m[4] === 0.0 && m[5] === 1.0 && m[6] === 0.0 && m[7] === 0.0 &&
            m[8] === 0.0 && m[9] === 0.0 && m[10] === 1.0 && m[11] === 0.0 &&
            m[12] === 0.0 && m[13] === 0.0 && m[14] === 0.0 && m[15] === 1.0;
    }

    public static from(values: ArrayLike<float>): Mat;
    public static from(mat: Mat): Mat;
    public static from(quaternion: Quaternion): Mat;
    public static from(mat: Mat | ArrayLike<float> | Quaternion): Mat {
        let out = new Mat();
        return out.from(mat);
    }

    public from(values: ArrayLike<float>): Mat;
    public from(mat: Mat): Mat;
    public from(quaternion: Quaternion): Mat;
    public from(mat: Mat | ArrayLike<float> | Quaternion): Mat;
    public from(mat: Mat | ArrayLike<float> | Quaternion): Mat {
        if (mat instanceof Mat)
            this.m.set(mat.m);
        else if (mat instanceof Quaternion) {
            const xx = mat.x * mat.x;
            const yy = mat.y * mat.y;
            const zz = mat.z * mat.z;
            const xy = mat.x * mat.y;
            const zw = mat.z * mat.w;
            const zx = mat.z * mat.x;
            const yw = mat.y * mat.w;
            const yz = mat.y * mat.z;
            const xw = mat.x * mat.w;

            this.m[0] = 1.0 - (2.0 * (yy + zz));
            this.m[1] = 2.0 * (xy + zw);
            this.m[2] = 2.0 * (zx - yw);
            this.m[3] = 0.0;

            this.m[4] = 2.0 * (xy - zw);
            this.m[5] = 1.0 - (2.0 * (zz + xx));
            this.m[6] = 2.0 * (yz + xw);
            this.m[7] = 0.0;

            this.m[8] = 2.0 * (zx + yw);
            this.m[9] = 2.0 * (yz - xw);
            this.m[10] = 1.0 - (2.0 * (yy + xx));
            this.m[11] = 0.0;

            this.m[12] = 0.0;
            this.m[13] = 0.0;
            this.m[14] = 0.0;
            this.m[15] = 1.0;
        }
        else
            this.m.set(mat);
        return this;
    }

    public get3x3(): Mat {
        let out = this.clone();
        out.m[3] = 0.0;
        out.m[7] = 0.0;
        out.m[11] = 0.0;
        out.m[12] = 0.0;
        out.m[13] = 0.0;
        out.m[14] = 0.0;
        out.m[15] = 1.0;
        return out;
    }

    public invert(): Mat {
        return this.invertFrom(this);
    }

    public invertFrom(other: Mat): Mat {
        if (other.isIdentity())
            return this.from(Mat.IDENTITY);

        const m = other.m;
        const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
        const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
        const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
        const m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];

        const det_22_33 = m22 * m33 - m32 * m23;
        const det_21_33 = m21 * m33 - m31 * m23;
        const det_21_32 = m21 * m32 - m31 * m22;
        const det_20_33 = m20 * m33 - m30 * m23;
        const det_20_32 = m20 * m32 - m22 * m30;
        const det_20_31 = m20 * m31 - m30 * m21;

        const cofact_00 = +(m11 * det_22_33 - m12 * det_21_33 + m13 * det_21_32);
        const cofact_01 = -(m10 * det_22_33 - m12 * det_20_33 + m13 * det_20_32);
        const cofact_02 = +(m10 * det_21_33 - m11 * det_20_33 + m13 * det_20_31);
        const cofact_03 = -(m10 * det_21_32 - m11 * det_20_32 + m12 * det_20_31);

        const det = m00 * cofact_00 + m01 * cofact_01 + m02 * cofact_02 + m03 * cofact_03;

        if (det === 0) {
            return this;
        }

        const detInv = 1 / det;
        const det_12_33 = m12 * m33 - m32 * m13;
        const det_11_33 = m11 * m33 - m31 * m13;
        const det_11_32 = m11 * m32 - m31 * m12;
        const det_10_33 = m10 * m33 - m30 * m13;
        const det_10_32 = m10 * m32 - m30 * m12;
        const det_10_31 = m10 * m31 - m30 * m11;
        const det_12_23 = m12 * m23 - m22 * m13;
        const det_11_23 = m11 * m23 - m21 * m13;
        const det_11_22 = m11 * m22 - m21 * m12;
        const det_10_23 = m10 * m23 - m20 * m13;
        const det_10_22 = m10 * m22 - m20 * m12;
        const det_10_21 = m10 * m21 - m20 * m11;

        const cofact_10 = -(m01 * det_22_33 - m02 * det_21_33 + m03 * det_21_32);
        const cofact_11 = +(m00 * det_22_33 - m02 * det_20_33 + m03 * det_20_32);
        const cofact_12 = -(m00 * det_21_33 - m01 * det_20_33 + m03 * det_20_31);
        const cofact_13 = +(m00 * det_21_32 - m01 * det_20_32 + m02 * det_20_31);

        const cofact_20 = +(m01 * det_12_33 - m02 * det_11_33 + m03 * det_11_32);
        const cofact_21 = -(m00 * det_12_33 - m02 * det_10_33 + m03 * det_10_32);
        const cofact_22 = +(m00 * det_11_33 - m01 * det_10_33 + m03 * det_10_31);
        const cofact_23 = -(m00 * det_11_32 - m01 * det_10_32 + m02 * det_10_31);

        const cofact_30 = -(m01 * det_12_23 - m02 * det_11_23 + m03 * det_11_22);
        const cofact_31 = +(m00 * det_12_23 - m02 * det_10_23 + m03 * det_10_22);
        const cofact_32 = -(m00 * det_11_23 - m01 * det_10_23 + m03 * det_10_21);
        const cofact_33 = +(m00 * det_11_22 - m01 * det_10_22 + m02 * det_10_21);

        return this.from([
            cofact_00 * detInv, cofact_10 * detInv, cofact_20 * detInv, cofact_30 * detInv,
            cofact_01 * detInv, cofact_11 * detInv, cofact_21 * detInv, cofact_31 * detInv,
            cofact_02 * detInv, cofact_12 * detInv, cofact_22 * detInv, cofact_32 * detInv,
            cofact_03 * detInv, cofact_13 * detInv, cofact_23 * detInv, cofact_33 * detInv
        ]);
    }

    public get data(): ArrayLike<number> {
        return this.m;
    }

    public clone(): Mat {
        return new Mat(this.m);
    }

    public static multiply(mat1: Mat, mat2: Mat): Mat {
        return mat1.multiply(mat2);
    }

    public multiply(value: number): Mat;
    public multiply(mat: Mat): Mat;
    public multiply(vec: Vec4): Vec4;
    public multiply(rhs: Vec4 | Mat | number): Vec4 | Mat {
        if (rhs instanceof Vec4) {
            let vec = new Vec4();
            for (let i = 0; i < 4; ++i) {
                let val = 0;
                for (let j = 0; j < 4; ++j) {
                    val += rhs.at(j) * this.at(i, j);
                }
                vec.set(i, val);
            }
            return vec;
        }
        else if (rhs instanceof Mat) {
            let res = new Mat();
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    let value = 0;
                    for (let k = 0; k < 4; k++) {
                        value += this.at(i, k) * rhs.at(k, j);
                    }
                    res.set(i, j, value);
                }
            }
            return res;
        }
        else if (typeof rhs === 'number') {
            let res = new Mat(this.m.map((v) => rhs * v));
            return res;
        }
        throw new Error('Bad type');
    }

    public static get Identity(): Mat {
        return new Mat();
    }

    public static get Zeros(): Mat {
        return new Mat(0);
    }

    public at(row: number, col: number) {
        return this.m[col * 4 + row];
    }

    public set(idx: number, value: number): void;
    public set(row: number, col: number, value: number): void;
    public set(row: number, col: number, value?: number): void {
        if (value === undefined)
            this.m[row] = col;
        else
            this.m[col * 4 + row] = value;
    }

    public print(): void {
        console.log('Matrix data:', this.data);
    }

    public transposed(): Mat {
        const m = new Mat();
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                m.set(j, i, this.at(i, j));
            }
        }
        this.m = m.m;
        return this;
    }

    public static transpose(m: Mat): Mat {
        const res = new Mat();
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                res.set(j, i, m.at(i, j));
            }
        }
        return res;
    }

    /**
     * Generates a perspective projection matrix with the given bounds
     *
     * @param {number} fov Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {Mat} Projection matrix
    */
    public static Perspective(fov: number, aspect: number, near: number, far: number, out?: Mat): Mat {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);

        if (out) {
            return out.from([
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, (2 * far * near) * nf, 0,
            ]);
        }
        else {
            return new Mat([
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, (2 * far * near) * nf, 0,
            ]);
        }
    }

    public static Orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number, out?: Mat): Mat {
        console.log('left', left);
        console.log('right', right);
        console.log('bottom', bottom);
        console.log('top', top);
        console.log('near', near);
        console.log('far', far);
        if (out) {
            return out.from([
                2.0 / (right - left), 0.0, 0.0, 0.0,
                0.0, 2.0 / (top - bottom), 0.0, 0.0,
                0.0, 0.0, 2.0 / (near - far), 0.0,
                (left + right) / (left - right), (bottom + top) / (bottom - top), (near + far) / (near - far), 1.0,
            ]);
        }
        else {
            return new Mat([
                2.0 / (right - left), 0.0, 0.0, 0.0,
                0.0, 2.0 / (top - bottom), 0.0, 0.0,
                0.0, 0.0, 2.0 / (near - far), 0.0,
                (left + right) / (left - right), (bottom + top) / (bottom - top), (near + far) / (near - far), 1.0,
            ]);
        }
        /*
        let n = znear;
        let f = zfar;

        let a = 2.0 / (right - left);
        let b = 2.0 / (top - bottom);
        let c = 2.0 / (f - n);
        let d = -(f + n) / (f - n);
        let i0 = (left + right) / (left - right);
        let i1 = (top + bottom) / (bottom - top);

        Matrix.FromValuesToRef(
            a, 0.0, 0.0, 0.0,
            0.0, b, 0.0, 0.0,
            0.0, 0.0, c, 0.0,
            i0, i1, d, 1.0,
            result
        );
        */
    }

    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis
     *
     * @param {Vec3} eye Position of the viewer
     * @param {Vec3} point Point the viewer is looking at
     * @param {Vec3} up vec3 pointing up
     * @returns {Mat} out
     */
    public static LookAt(eye: Vec3, center: Vec3, up: Vec3, out?: Mat): Mat {
        const forward: Vec3 = Vec3.Sub(eye, center).normalized();
        const right: Vec3 = Vec3.Cross(up, forward).normalized();
        const newUp: Vec3 = Vec3.Cross(forward, right);

        let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
        let eyex = eye.at(0);
        let eyey = eye.at(1);
        let eyez = eye.at(2);
        let upx = up.at(0);
        let upy = up.at(1);
        let upz = up.at(2);
        let centerx = center.at(0);
        let centery = center.at(1);
        let centerz = center.at(2);

        if (Math.abs(eyex - centerx) < Maths.EPSILON &&
            Math.abs(eyey - centery) < Maths.EPSILON &&
            Math.abs(eyez - centerz) < Maths.EPSILON) {
            return Mat.Identity;
        }

        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;

        len = 1 / Math.hypot(z0, z1, z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;

        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.hypot(x0, x1, x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }

        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        len = Math.hypot(y0, y1, y2);
        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        } else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }

        if (out) {
            return out.from([
                x0, y0, z0, 0,
                x1, y1, z1, 0,
                x2, y2, z2, 0,
                -(x0 * eyex + x1 * eyey + x2 * eyez), -(y0 * eyex + y1 * eyey + y2 * eyez), -(z0 * eyex + z1 * eyey + z2 * eyez), 1
            ]);
        }
        else {
            return new Mat([
                x0, y0, z0, 0,
                x1, y1, z1, 0,
                x2, y2, z2, 0,
                -(x0 * eyex + x1 * eyey + x2 * eyez), -(y0 * eyex + y1 * eyey + y2 * eyez), -(z0 * eyex + z1 * eyey + z2 * eyez), 1
            ]);
        }
     }

    public static Rotation(angles: Vec3): Mat;
    public static Rotation(axis: Vec3, angle: number): Mat;
    public static Rotation(axis: Vec3, angle?: number): Mat {
        let result = new Mat();

        if (angle === undefined) {
            const Rx = Mat.RotationX(axis.x);
            const Ry = Mat.RotationY(axis.y);
            const Rz = Mat.RotationZ(axis.z);
            result = (Rz.multiply(Ry)).multiply(Rx);
        }
        else {
            // debugger;
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            const t = 1.0 - c;

            result.set(0, 0, t * axis.x * axis.x + c);
            result.set(1, 0, t * axis.x * axis.y + s * axis.z);
            result.set(2, 0, t * axis.x * axis.z - s * axis.y);
            result.set(0, 1, t * axis.x * axis.y - s * axis.z);
            result.set(1, 1, t * axis.y * axis.y + c);
            result.set(2, 1, t * axis.y * axis.z + s * axis.x);
            result.set(0, 2, t * axis.x * axis.z + s * axis.y);
            result.set(1, 2, t * axis.y * axis.z - s * axis.x);
            result.set(2, 2, t * axis.z * axis.z + c);
        }

        return result;
    }

    public static RotationX(angle: number): Mat {
        return Mat.Rotation(new Vec3(1, 0, 0), angle);
    }

    public static RotationY(angle: number): Mat {
        return Mat.Rotation(new Vec3(0, 1, 0), angle);
    }

    public static RotationZ(angle: number): Mat {
        return Mat.Rotation(new Vec3(0, 0, 1), angle);
    }

    public static Scale(value: number): Mat;
    public static Scale(value: Vec3): Mat;
    public static Scale(x: number, y: number, z: number): Mat;
    public static Scale(values: [number, number, number]): Mat;
    public static Scale(x: number | [number, number, number] | Vec3, y?: number, z?: number): Mat {
        if (typeof x === 'number') {
            if (y !== undefined && z !== undefined) {
                return new Mat(
                    [
                        x, 0, 0, 0,
                        0, y, 0, 0,
                        0, 0, z, 0,
                        0, 0, 0, 1,
                    ]
                );
            }
            else {
                return new Mat(
                    [
                        x, 0, 0, 0,
                        0, x, 0, 0,
                        0, 0, x, 0,
                        0, 0, 0, 1,
                    ]
                );
            }
        }
        else if (Array.isArray(x)) {
            return new Mat(
                [
                    x[0], 0, 0, 0,
                    0, x[1], 0, 0,
                    0, 0, x[2], 0,
                    0, 0, 0, 1,
                ]
            );
        }
        else {
            return new Mat(
                [
                    x.x, 0, 0, 0,
                    0, x.y, 0, 0,
                    0, 0, x.z, 0,
                    0, 0, 0, 1,
                ]
            );
        }
    }

    public static Translate(mat: Mat, vec: Vec3): Mat {
        let m = Mat.Translation(vec);
        mat = mat.multiply(m);
        return mat;
    }

    public static Rotate(mat: Mat, axis: Vec3, angle: number): Mat {
        let m = Mat.Rotation(axis, angle);
        mat = mat.multiply(m);
        return mat;
    }

    public static Translation(vec: Vec3): Mat;
    public static Translation(vec: [number, number, number]): Mat;
    public static Translation(x: number, y: number, z: number): Mat;
    public static Translation(x: number | Vec3 | [number, number, number], y?: number, z?: number): Mat {
        if (typeof x === 'number') {
            y = <number>y;
            z = <number>z;
            return new Mat(
                [
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    x, y, z, 1,
                ]
            );
        }
        else if (Array.isArray(x)) {
            return new Mat(
                [
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    x[0], x[1], x[2], 1,
                ]
            );
        }
        else {
            return new Mat(
                [
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    x.x, x.y, x.z, 1,
                ]
            );
        }
    }

    public static TransformCoordinates(transformation: Mat, vector: Vec3, out?: Vec3): Vec3 {
        const m = transformation.m;
        const x = vector.x;
        const y = vector.y;
        const z = vector.z;

        const rx = x * m[0] + y * m[4] + z * m[8] + m[12];
        const ry = x * m[1] + y * m[5] + z * m[9] + m[13];
        const rz = x * m[2] + y * m[6] + z * m[10] + m[14];
        const rw = 1 / (x * m[3] + y * m[7] + z * m[11] + m[15]);

        if (out) {
            out.x = rx * rw;
            out.y = ry * rw;
            out.z = rz * rw;
            return out;
        }
        else {
            return new Vec3(rx * rw, ry * rw, rz * rw);
        }
    }

    public static TransformNormal(transformation: Mat, vector: Vec3, out?: Vec3): Vec3 {
        const m = transformation.m;
        const x = vector.x;
        const y = vector.y;
        const z = vector.z;

        if (out) {
            out.x = x * m[0] + y * m[4] + z * m[8];
            out.y = x * m[1] + y * m[5] + z * m[9];
            out.z = x * m[2] + y * m[6] + z * m[10];
            return out;
        }
        else {
            return new Vec3(x * m[0] + y * m[4] + z * m[8], x * m[1] + y * m[5] + z * m[9], x * m[2] + y * m[6] + z * m[10]);
        }
    }

    public static RotationAlign(from: Vec3, to: Vec3, out?: Mat): Mat {
        const v = Vec3.Cross(to, from);
        const c = to.dot(from);
        const k = 1 / (1 + c);

        if (out) {
            out.from([
                v.x * v.x * k + c,      v.y * v.x * k - v.z,        v.z * v.x * k + v.y,        0,
                v.x * v.y * k + v.z,    v.y * v.y * k + c,          v.z * v.y * k - v.x,        0,
                v.x * v.z * k - v.y,    v.y * v.z * k + v.x,        v.z * v.z * k + c,          0,
                0,                      0,                          0,                          1,
            ]);
            return out;
        }
        else {
            return new Mat([
                v.x * v.x * k + c,      v.y * v.x * k - v.z,        v.z * v.x * k + v.y,        0,
                v.x * v.y * k + v.z,    v.y * v.y * k + c,          v.z * v.y * k - v.x,        0,
                v.x * v.z * k - v.y,    v.y * v.z * k + v.x,        v.z * v.z * k + c,          0,
                0,                      0,                          0,                          1,
            ]);
        }
    }

}