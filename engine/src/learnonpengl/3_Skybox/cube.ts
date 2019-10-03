import { WebGLContext } from '../../core/gl/webglContext';
import { Shader } from 'src/core/gl/shaders/shader';
import { Texture2D } from 'src/core/graphics/texture';
import { Mat } from 'src/core/maths';
import { DrawMode, DrawModeToGL } from 'src/core/graphics/renderer';

export class Cube {

    protected static readonly xo = -1;
    protected static readonly x1 = 1;
    protected static readonly y0 = -1;
    protected static readonly y1 = 1;
    protected static readonly z0 = -1;
    protected static readonly z1 = 1;

    protected static readonly VERTICES = new Float32Array([
        Cube.xo, Cube.y1, Cube.z1, 0,   //0 Front
        Cube.xo, Cube.y0, Cube.z1, 0,   //1
        Cube.x1, Cube.y0, Cube.z1, 0,   //2
        Cube.x1, Cube.y1, Cube.z1, 0,   //3

        Cube.x1, Cube.y1, Cube.z0, 1,   //4 Back
        Cube.x1, Cube.y0, Cube.z0, 1,   //5
        Cube.xo, Cube.y0, Cube.z0, 1,   //6
        Cube.xo, Cube.y1, Cube.z0, 1,   //7 

        Cube.xo, Cube.y1, Cube.z0, 2,   //7 Left
        Cube.xo, Cube.y0, Cube.z0, 2,   //6
        Cube.xo, Cube.y0, Cube.z1, 2,   //1
        Cube.xo, Cube.y1, Cube.z1, 2,   //0

        Cube.xo, Cube.y0, Cube.z1, 3,   //1 Bottom
        Cube.xo, Cube.y0, Cube.z0, 3,   //6
        Cube.x1, Cube.y0, Cube.z0, 3,   //5
        Cube.x1, Cube.y0, Cube.z1, 3,   //2

        Cube.x1, Cube.y1, Cube.z1, 4,   //3 Right
        Cube.x1, Cube.y0, Cube.z1, 4,   //2 
        Cube.x1, Cube.y0, Cube.z0, 4,   //5
        Cube.x1, Cube.y1, Cube.z0, 4,   //4

        Cube.xo, Cube.y1, Cube.z0, 5,   //7 Top
        Cube.xo, Cube.y1, Cube.z1, 5,   //0
        Cube.x1, Cube.y1, Cube.z1, 5,   //3
        Cube.x1, Cube.y1, Cube.z0, 5    //4
    ]);

    protected _vertexLocation: GLint = 0;
    protected _normalLocation: GLint = 1;
    protected _uvLocation: GLint = 2;

    protected _indices: Uint16Array;
    protected _uvs: Float32Array;
    protected _normals: Float32Array;

    protected _VAO: WebGLVertexArrayObject;
    protected _VBO: WebGLBuffer;
    protected _IBO: WebGLBuffer;
    protected _NBO: WebGLBuffer;
    protected _UVBO: WebGLBuffer;

    protected _shader!: Shader;

    protected _texture!: Texture2D;

    protected _context: WebGLContext;

    constructor(context: WebGLContext, name?: string) {
        this._context = context;

        let indices = [];
        for (let i = 0; i < Cube.VERTICES.length / 4; i += 2)
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

        const gl = context.gl;

        this._VAO = gl.createVertexArray()!;
        this._VBO = gl.createBuffer()!;
        this._IBO = gl.createBuffer()!;
        this._NBO = gl.createBuffer()!;
        this._UVBO = gl.createBuffer()!;
    }

    public set shader(shader: Shader) {
        this._shader = shader;
    }

    public set texture(texture: Texture2D) {
        this._texture = texture;
    }

    public prepare(): void {
        const gl = this._context.gl;
        gl.bindVertexArray(this._VAO);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._VBO);
        gl.bufferData(gl.ARRAY_BUFFER, Cube.VERTICES, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._NBO);
        gl.bufferData(gl.ARRAY_BUFFER, this._normals, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._UVBO);
        gl.bufferData(gl.ARRAY_BUFFER, this._uvs, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._IBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);

        this._shader.bind();
        this._shader.setUniform1i('texture0', 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    public render(model: Mat, view: Mat, proj: Mat, mode?: DrawMode): void {
        const gl = this._context.gl;

        if (!mode) mode = 'TRIANGLES';

        this._shader.bind();
        this._shader.setUniformMatrix4fv('model', model);
        this._shader.setUniformMatrix4fv('view', view);
        this._shader.setUniformMatrix4fv('projection', proj);

        gl.bindVertexArray(this._VAO);
        this._texture.bind(0);

        gl.drawElements(DrawModeToGL(gl, mode), 36, gl.UNSIGNED_SHORT, 0);

        gl.bindVertexArray(null);
    }
}