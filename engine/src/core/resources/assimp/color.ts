import { float, int } from "src/core/utils/types";

export class aiColor3D {
    public r: float;
    public g: float;
    public b: float;

    constructor();
    constructor(r: float, g: float, b: float);
    constructor(r?: float, g?: float, b?: float) {
        if (typeof r === 'undefined') {
            this.r = this.g = this.b = 0.0;
        }
        else {
            this.r = r;
            this.g = g!;
            this.b = b!;
        }
    }

    public add(color: aiColor3D): this {
        this.r += color.r;
        this.g += color.g;
        this.b += color.b;
        return this;
    }

    public subtract(color: aiColor3D): this {
        this.r -= color.r;
        this.g -= color.g;
        this.b -= color.b;
        return this;
    }

    public multiply(f: float): this {
        this.r *= f;
        this.g *= f;
        this.b *= f;
        return this;
    }

    public divide(f: float): this;
    public divide(f: aiColor3D): this;
    public divide(f: float | aiColor3D): this {
        if (f instanceof aiColor3D) {
            this.r /= f.r;
            this.g /= f.g;
            this.b /= f.b;
        }
        else {
            this.r /= f;
            this.g /= f;
            this.b /= f;
        }
        return this;
    }

    public at(index: int): float {
        switch (index) {
            case 0: return this.r;
            case 1: return this.g;
            case 2: return this.b;
            default: break;
        }
        return this.r;
    }

    public equals(color: aiColor3D): boolean {
        return this.r === color.r
            && this.g === color.g
            && this.b === color.b
        ;
    }

    public lt(color: aiColor3D): boolean {
        return this.r < color.r || (
            this.r === color.r && (
                this.g < color.g || (
                    this.g === color.g && (
                        this.b < color.b
                    )
                )
            )
        );
    }

    public static IsBlack(color: aiColor3D): boolean {
        const epsilon = 1e-3;
        return Math.abs(color.r) < epsilon
            && Math.abs(color.g) < epsilon
            && Math.abs(color.b) < epsilon
        ;
    }

    public static Add(v: aiColor3D, w: aiColor3D): aiColor3D {
        return new aiColor3D(v.r + w.r, v.g + w.g, v.b + w.b);
    }

    public static Subtract(v: aiColor3D, w: aiColor3D): aiColor3D {
        return new aiColor3D(v.r - w.r, v.g - w.g, v.b - w.b);
    }

    public static Multiply(v: aiColor3D, w: float): aiColor3D;
    public static Multiply(v: float, w: aiColor3D): aiColor3D;
    public static Multiply(v: aiColor3D, w: aiColor3D): aiColor3D;
    public static Multiply(v: aiColor3D | float, w: aiColor3D | float): aiColor3D {
        if (typeof w === 'number') {
            return new aiColor3D((<aiColor3D>v).r * w, (<aiColor3D>v).g * w, (<aiColor3D>v).b * w);
        }
        else if (typeof v === 'number') {
            return new aiColor3D((<aiColor3D>w).r * v, (<aiColor3D>w).g * v, (<aiColor3D>w).b * v);
        }
        else {
            return new aiColor3D(v.r * w.r, v.g * w.g, v.b * w.b);
        }
    }

    public static Divide(v: aiColor3D, w: float): aiColor3D;
    public static Divide(v: float, w: aiColor3D): aiColor3D;
    public static Divide(v: aiColor3D, w: aiColor3D): aiColor3D;
    public static Divide(v: aiColor3D | float, w: aiColor3D | float): aiColor3D {
        if (typeof w === 'number') {
            return aiColor3D.Multiply(<aiColor3D>v, 1 / w);
        }
        else if (typeof v === 'number') {
            return new aiColor3D(v, v, v).divide(w);
        }
        else {
            return new aiColor3D(v.r / w.r, v.g / w.g, v.b / w.b);
        }
    }
}

export class aiColor4D {
    public r: float;
    public g: float;
    public b: float;
    public a: float;

    constructor();
    constructor(r: float, g: float, b: float, a: float);
    constructor(r?: float, g?: float, b?: float, a?: float) {
        if (typeof r === 'undefined') {
            this.r = this.g = this.b = this.a = 0.0;
        }
        else {
            this.r = r;
            this.g = g!;
            this.b = b!;
            this.a = a!;
        }
    }

    public add(color: aiColor4D): aiColor4D {
        this.r += color.r;
        this.g += color.g;
        this.b += color.b;
        this.a += color.a;
        return this;
    }

    public subtract(color: aiColor4D): aiColor4D {
        this.r -= color.r;
        this.g -= color.g;
        this.b -= color.b;
        this.a -= color.a;
        return this;
    }

    public multiply(f: float): aiColor4D {
        this.r *= f;
        this.g *= f;
        this.b *= f;
        this.a *= f;
        return this;
    }

    public divide(f: float): aiColor4D;
    public divide(f: aiColor4D): aiColor4D;
    public divide(f: float | aiColor4D): aiColor4D {
        if (f instanceof aiColor4D) {
            this.r /= f.r;
            this.g /= f.g;
            this.b /= f.b;
            this.a /= f.a;
        }
        else {
            this.r /= f;
            this.g /= f;
            this.b /= f;
            this.a /= f;
        }
        return this;
    }

    public at(index: int): float {
        switch (index) {
            case 0: return this.r;
            case 1: return this.g;
            case 2: return this.b;
            case 3: return this.a;
            default: break;
        }
        return this.r;
    }

    public equals(color: aiColor4D): boolean {
        return this.r === color.r
            && this.g === color.g
            && this.b === color.b
            && this.a === color.a
        ;
    }

    public lt(color: aiColor4D): boolean {
        return this.r < color.r || (
            this.r === color.r && (
                this.g < color.g || (
                    this.g === color.g && (
                        this.b < color.b || (
                            this.b === color.b && (
                                this.a < color.a
                            )
                        )
                    )
                )
            )
        );
    }

    public static IsBlack(color: aiColor4D): boolean {
        const epsilon = 1e-3;
        return Math.abs(color.r) < epsilon
            && Math.abs(color.g) < epsilon
            && Math.abs(color.b) < epsilon
        ;
    }

    public static Add(v: aiColor4D, w: aiColor4D): aiColor4D {
        return new aiColor4D(v.r + w.r, v.g + w.g, v.b + w.b, v.a + w.a);
    }

    public static Subtract(v: aiColor4D, w: aiColor4D): aiColor4D {
        return new aiColor4D(v.r - w.r, v.g - w.g, v.b - w.b, v.a - w.a);
    }

    public static Multiply(v: aiColor4D, w: float): aiColor4D;
    public static Multiply(v: float, w: aiColor4D): aiColor4D;
    public static Multiply(v: aiColor4D, w: aiColor4D): aiColor4D;
    public static Multiply(v: aiColor4D | float, w: aiColor4D | float): aiColor4D {
        if (typeof w === 'number') {
            return new aiColor4D((<aiColor4D>v).r * w, (<aiColor4D>v).g * w, (<aiColor4D>v).b * w, (<aiColor4D>v).a * w);
        }
        else if (typeof v === 'number') {
            return new aiColor4D((<aiColor4D>w).r * v, (<aiColor4D>w).g * v, (<aiColor4D>w).b * v, (<aiColor4D>w).a * v);
        }
        else {
            return new aiColor4D(v.r * w.r, v.g * w.g, v.b * w.b, v.a * w.a);
        }
    }

    public static Divide(v: aiColor4D, w: float): aiColor4D;
    public static Divide(v: float, w: aiColor4D): aiColor4D;
    public static Divide(v: aiColor4D, w: aiColor4D): aiColor4D;
    public static Divide(v: aiColor4D | float, w: aiColor4D | float): aiColor4D {
        if (typeof w === 'number') {
            return aiColor4D.Multiply(<aiColor4D>v, 1 / w);
        }
        else if (typeof v === 'number') {
            return new aiColor4D(v, v, v, v).divide(w);
        }
        else {
            return new aiColor4D(v.r / w.r, v.g / w.g, v.b / w.b, v.a / w.a);
        }
    }
}