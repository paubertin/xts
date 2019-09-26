import { GLclampf4, GLclampf3, clone4, equals4 } from '../utils/tuples';
import { bool } from '../utils/types';
import { clamp } from '../maths';

export class Color {
    protected static readonly DEFAULT_ALPHA: GLclampf = 1.0;

    protected _rgba: GLclampf4 = [0.0, 0.0, 0.0, Color.DEFAULT_ALPHA];
    protected _altered: bool = false;

    constructor();
    constructor(other?: Color);
    constructor(rgb: GLclampf3);
    constructor(rgba: GLclampf4);
    constructor(r: GLclampf, g: GLclampf, b: GLclampf);
    constructor(r: GLclampf, g: GLclampf, b: GLclampf, a: GLclampf);
    constructor(r?: GLclampf | GLclampf3 | GLclampf4 | Color, g?: GLclampf, b?: GLclampf, a?: GLclampf) {
        if (r === undefined) return;
        if (r instanceof Color) {
            this.fromFloat(r.r, r.g, r.b, r.a);
        }
        else if (typeof r === 'number') {
            this.fromFloat(r, <GLfloat>g, <GLfloat>b, a);
        }
        else if (r.length === 3) {
            this.fromFloat(r[0], r[1], r[2]);
        }
        else {
            this.fromFloat(r[0], r[1], r[2], r[3]);
        }
    }

    public fromFloat(red: GLfloat, green: GLfloat, blue: GLfloat, alpha: GLfloat = Color.DEFAULT_ALPHA) {
        const previous = clone4<GLclampf>(this._rgba);
        this._rgba[0] = clamp(red);
        this._rgba[1] = clamp(green);
        this._rgba[2] = clamp(blue);
        this._rgba[3] = clamp(alpha);
        this._altered = !equals4<GLclampf>(this._rgba, previous);
        return this;
    }

    public toArray(): GLclampf4 {
        return this._rgba;
    }

    public get r(): GLclampf {
        return this._rgba[0];
    }

    public get g(): GLclampf {
        return this._rgba[1];
    }

    public get b(): GLclampf {
        return this._rgba[2];
    }

    public get a(): GLclampf {
        return this._rgba[3];
    }

    public static get WHITE(): Color {
        return new Color(1.0, 1.0, 1.0, 1.0);
    }

    public static get BLACK(): Color {
        return new Color(0, 0, 0, 1.0);
    }

    public static get RED(): Color {
        return new Color(1.0, 0, 0, 1.0);
    }

    public static get GREEN(): Color {
        return new Color(0, 1.0, 0, 1.0);
    }

    public static get BLUE(): Color {
        return new Color(0, 0, 1.0, 1.0);
    }
}