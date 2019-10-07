import { float } from "src/core/utils/types";

export class Quaternion {
    constructor(public x: float = 0.0,
        public y: float = 0.0,
        public z: float = 0.0,
        public w: float = 1.0) {
    }

    public from(x: float, y: float, z: float, w: float): Quaternion;
    public from(q: Quaternion): Quaternion;
    public from(q: Quaternion | float, y?: float, z?: float, w?: float): Quaternion {
        if (q instanceof Quaternion) {
            this.x = q.x;
            this.y = q.y;
            this.z = q.z;
            this.w = q.w;
        }
        else {
            this.x = q;
            this.y = y!;
            this.z = z!;
            this.w = w!;
        }
        return this;
    }

    public clone(): Quaternion {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    public equals(q: Quaternion): boolean {
        return this.x === q.x && this.y === q.y && this.z === q.z && this.w === q.w;
    }

    public static multiply(q1: Quaternion, q2: Quaternion): Quaternion {
        let q = q1.clone();
        return q.multiply(q2);
    }

    public multiply(q: Quaternion): Quaternion {
        const x = this.x * q.w + this.y * q.z - this.z * q.y + this.w * q.x;
        const y = -this.x * q.z + this.y * q.w + this.z * q.x + this.w * q.y;
        const z = this.x * q.y - this.y * q.x + this.z * q.w + this.w * q.z;
        const w = -this.x * q.x - this.y * q.y - this.z * q.z + this.w * q.w;
        return this.from(x, y, z, w);
    }

    public static RotationYawPitchRoll(yaw: float, pitch: float, roll: float, out?: Quaternion): Quaternion {
        const halfYaw = yaw * 0.5;
        const halfRoll = roll * 0.5;
        const halfPitch = pitch * 0.5;

        const sinYaw = Math.sin(halfYaw);
        const cosYaw = Math.cos(halfYaw);
        const sinRoll = Math.sin(halfRoll);
        const cosRoll = Math.cos(halfRoll);
        const sinPitch = Math.sin(halfPitch);
        const cosPitch = Math.cos(halfPitch);

        if (out) {
            out.x = (cosYaw * sinPitch * cosRoll) + (sinYaw * cosPitch * sinRoll);
            out.y = (sinYaw * cosPitch * cosRoll) - (cosYaw * sinPitch * sinRoll);
            out.z = (cosYaw * cosPitch * sinRoll) - (sinYaw * sinPitch * cosRoll);
            out.w = (cosYaw * cosPitch * cosRoll) + (sinYaw * sinPitch * sinRoll);
            return out;
        }
        else {
            return new Quaternion(
                (cosYaw * sinPitch * cosRoll) + (sinYaw * cosPitch * sinRoll),
                (sinYaw * cosPitch * cosRoll) - (cosYaw * sinPitch * sinRoll),
                (cosYaw * cosPitch * sinRoll) - (sinYaw * sinPitch * cosRoll),
                (cosYaw * cosPitch * cosRoll) + (sinYaw * sinPitch * sinRoll)
            );
        }
    }
    
}