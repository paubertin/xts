import { Geometry } from "../geometry";
import { WebGLContext } from "../gl/webglContext";
import { VertexBuffer, IndexBuffer } from "../gl/buffer";

const scale = 0.5;

export class CubeGeometry extends Geometry {

    protected static readonly xo = -1 * scale;
    protected static readonly x1 = 1 * scale;
    protected static readonly y0 = -1 * scale;
    protected static readonly y1 = 1 * scale;
    protected static readonly z0 = -1 * scale;
    protected static readonly z1 = 1 * scale;

    protected static readonly VERTICES = new Float32Array([
        CubeGeometry.xo, CubeGeometry.y1, CubeGeometry.z1, 0,   //0 Front
        CubeGeometry.xo, CubeGeometry.y0, CubeGeometry.z1, 0,   //1
        CubeGeometry.x1, CubeGeometry.y0, CubeGeometry.z1, 0,   //2
        CubeGeometry.x1, CubeGeometry.y1, CubeGeometry.z1, 0,   //3

        CubeGeometry.x1, CubeGeometry.y1, CubeGeometry.z0, 1,   //4 Back
        CubeGeometry.x1, CubeGeometry.y0, CubeGeometry.z0, 1,   //5
        CubeGeometry.xo, CubeGeometry.y0, CubeGeometry.z0, 1,   //6
        CubeGeometry.xo, CubeGeometry.y1, CubeGeometry.z0, 1,   //7 

        CubeGeometry.xo, CubeGeometry.y1, CubeGeometry.z0, 2,   //7 Left
        CubeGeometry.xo, CubeGeometry.y0, CubeGeometry.z0, 2,   //6
        CubeGeometry.xo, CubeGeometry.y0, CubeGeometry.z1, 2,   //1
        CubeGeometry.xo, CubeGeometry.y1, CubeGeometry.z1, 2,   //0

        CubeGeometry.xo, CubeGeometry.y0, CubeGeometry.z1, 3,   //1 Bottom
        CubeGeometry.xo, CubeGeometry.y0, CubeGeometry.z0, 3,   //6
        CubeGeometry.x1, CubeGeometry.y0, CubeGeometry.z0, 3,   //5
        CubeGeometry.x1, CubeGeometry.y0, CubeGeometry.z1, 3,   //2

        CubeGeometry.x1, CubeGeometry.y1, CubeGeometry.z1, 4,   //3 Right
        CubeGeometry.x1, CubeGeometry.y0, CubeGeometry.z1, 4,   //2 
        CubeGeometry.x1, CubeGeometry.y0, CubeGeometry.z0, 4,   //5
        CubeGeometry.x1, CubeGeometry.y1, CubeGeometry.z0, 4,   //4

        CubeGeometry.xo, CubeGeometry.y1, CubeGeometry.z0, 5,   //7 Top
        CubeGeometry.xo, CubeGeometry.y1, CubeGeometry.z1, 5,   //0
        CubeGeometry.x1, CubeGeometry.y1, CubeGeometry.z1, 5,   //3
        CubeGeometry.x1, CubeGeometry.y1, CubeGeometry.z0, 5    //4
    ]);

    protected _vertexLocation: GLint = 0;
    protected _normalLocation: GLint = 1;
    protected _uvLocation: GLint = 2;

    protected _indices: Uint16Array;
    protected _uvs: Float32Array;
    protected _normals: Float32Array;

    constructor(context: WebGLContext, name?: string) {
        super(context, name);

        let indices = [];
        for (let i = 0; i < CubeGeometry.VERTICES.length / 4; i += 2)
            indices.push(i, i + 1, (Math.floor(i / 4) * 4) + ((i + 2) % 4));
        
        this._indices = new Uint16Array(indices);

        let uvs = [];
        for (let i = 0; i < 6; i++)
            uvs.push(0, 0, 0, 1, 1, 1, 1, 0);

        this._uvs = new Float32Array(uvs);

        this._normals = new Float32Array([
            0, 0, 1,    0, 0, 1,    0, 0, 1,    0, 0, 1,    //Front
            0, 0, -1,   0, 0, -1,   0, 0, -1,   0, 0, -1,   //Back
            -1, 0, 0,   -1, 0, 0,   -1, 0, 0,   -1, 0, 0,   //Left
            0, -1, 0,   0, -1, 0,   0, -1, 0,   0, -1, 0,   //Bottom
            1, 0, 0,    1, 0, 0,    1, 0, 0,    1, 0, 0,    //Right
            0, 1, 0,    0, 1, 0,    0, 1, 0,    0, 1, 0     //Top
        ]);

        this._IBO = new IndexBuffer(context, name + 'IBO');
        this._NBO = new VertexBuffer(context, name + 'NBO');
        this._UVBO = new VertexBuffer(context, name + 'UVBO');
    }

    protected _initialize(): boolean {
        const gl = this.context.gl;
        const usage = gl.STATIC_DRAW;
        let valid = this._IBO.initialize() && this._NBO.initialize() && this._UVBO.initialize();

        this._VAO.bind();
        
        this._VBO.bind();
        this._VBO.pushData(CubeGeometry.VERTICES, usage);
        this._VBO.enableAttrib(this._vertexLocation, 4, gl.FLOAT, false);

        this._NBO.bind();
        this._NBO.pushData(this._normals, usage);
        this._NBO.enableAttrib(this._normalLocation, 3, gl.FLOAT, false);

        this._UVBO.bind();
        this._UVBO.pushData(this._uvs, usage);
        this._UVBO.enableAttrib(this._uvLocation, 2, gl.FLOAT, false);

        this._IBO.bind();
        this._IBO.pushData(this._indices, usage);
        
        this._VAO.eltCount = this._indices.length;

        this._VAO.unbind();
        this._unBindBuffers();

        return valid;
    }

    protected _unBindBuffers(): void {
        this._VBO.unbind();
        this._NBO.unbind();
        this._UVBO.unbind();
        // this._IBO.unbind();
    }

    public render(mode?: GLenum): void {
        const gl = this.context.gl;
        if (mode === undefined) mode = gl.TRIANGLES;
        gl.drawElements(mode, this._VAO.eltCount!, gl.UNSIGNED_SHORT, 0);
    }
}