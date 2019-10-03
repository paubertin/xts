import { Geometry } from "../geometry";
import { WebGLContext } from "../gl/webglContext";
import { Vec3 } from "../maths";
import { VertexBuffer } from "../gl/buffer";

export class SpriteGeometry extends Geometry {

    protected _vertexLocation: GLint = 0;

    protected static readonly VERTICES = new Float32Array([
        1.0,    1.0,    0.0,
        1.0,    -1.0,   0.0,
        -1.0,   -1.0,   0.0,
        -1.0,   1.0,    0.0,
    ]);

    protected static readonly INDICES = new Uint8Array([
        0, 1, 2, 3
    ]);

    protected _translation: Vec3 = new Vec3(0, 0, 0);
    protected _scale: Vec3 = new Vec3(1, 1, 1);

    constructor(context: WebGLContext, name?: string) {
        super(context, name);
        this._IBO = new VertexBuffer(context, name + 'IBO');
    }

    protected _unBindBuffers(): void {
        this._VBO.unbind();
        this._IBO.unbind();
    }

    protected _initialize(): boolean {
        const gl = this.context.gl;
        let valid = this._IBO.initialize();
        this._VBO.pushData(SpriteGeometry.VERTICES, gl.STATIC_DRAW);
        this._VBO.enableAttrib(this._vertexLocation, 3, this.context.gl.FLOAT, false, 0, 0);
        this._IBO.pushData(SpriteGeometry.INDICES, gl.STATIC_DRAW);
        return valid;
    }

    public render(): void {
        const gl = this.context.gl;
        gl.drawElements(gl.TRIANGLES, SpriteGeometry.INDICES.length, gl.UNSIGNED_BYTE, 0);
    }
}