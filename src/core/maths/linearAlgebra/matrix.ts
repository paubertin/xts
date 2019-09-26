import { Vec3, Vec4 } from "./vector";
import { float } from "src/core/utils/types";
import { Maths } from "..";

export class Mat {
    protected m!: Float32Array;

    constructor(value?: float | ArrayLike<float> | Mat) {
        this.m = new Float32Array(16);
        if (typeof value === 'number' || value === undefined) {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    if (i === j && value) this.set(i, j, value);
                    if (i === j && value === undefined) this.set(i, j, 1);
                }
            }
        }
        else if (value instanceof Mat) {
            this.m.set(value.m);
        }
        else {
            if (value.length !== 16) {
                throw new Error('Invalid parameters length while instantiating matrix');
            }
            this.m.set(value);
        }
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
        return new Mat(1);
    }

    public at(row: number, col: number) {
        return this.m[col * 4 + row];
    }

    public set(row: number, col: number, value: number): void {
        (this.m as any)[col * 4 + row] = value;
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
    public static Perspective(fov: number, aspect: number, near: number, far: number): Mat {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);

        return new Mat(
            [
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, (2 * far * near) * nf, 0,
            ]
        );
    }

    public static Orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat {
        return new Mat(
            [
                2.0 / (right - left), 0.0, 0.0, 0.0,
                0.0, 2.0 / (top - bottom), 0.0, 0.0,
                0.0, 0.0, 2.0 / (near - far), 0.0,
                (left + right) / (left - right), (bottom + top) / (bottom - top), -(near + far) / (near - far), 1.0,
            ]
        )
    }

    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis
     *
     * @param {Vec3} eye Position of the viewer
     * @param {Vec3} point Point the viewer is looking at
     * @param {Vec3} up vec3 pointing up
     * @returns {Mat} out
     */
    public static LookAt(eye: Vec3, center: Vec3, up: Vec3): Mat {
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

        let out = new Float32Array(16);

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

        return new Mat(
            [
                x0, y0, z0, 0,
                x1, y1, z1, 0,
                x2, y2, z2, 0,
                -(x0 * eyex + x1 * eyey + x2 * eyez), -(y0 * eyex + y1 * eyey + y2 * eyez), -(z0 * eyex + z1 * eyey + z2 * eyez), 1
            ]
        );
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

}