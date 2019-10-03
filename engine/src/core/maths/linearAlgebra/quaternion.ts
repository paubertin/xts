import { float } from "src/core/utils/types";

export class Quaternion {
    constructor(public x: float = 0.0,
        public y: float = 0.0,
        public z: float = 0.0,
        public w: float = 1.0) {
    }

    public from(q: Quaternion): void {
        this.x = q.x;
        this.y = q.y;
        this.z = q.z;
        this.w = q.w;
    }

    public clone(): Quaternion {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    public equals(q: Quaternion): boolean {
        return this.x === q.x && this.y === q.y && this.z === q.z && this.w === q.w;
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