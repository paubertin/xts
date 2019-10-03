import { WebGLContext } from "./gl/webglContext";
import { VertexBuffer, IndexBuffer } from "./gl/buffer";
import { VertexArray } from "./gl/vertexArray";
import { Initializable } from "./initializable";

export abstract class Geometry {
    protected _VAO: VertexArray;

    protected _VBO: VertexBuffer;  // vertices
    protected _IBO!: IndexBuffer;  // indices
    protected _NBO!: VertexBuffer;  // normals
    protected _UVBO!: VertexBuffer; // uvs

    constructor(context: WebGLContext, name?: string) {
        this._VAO = new VertexArray(context, name + 'VAO');
        this._VBO = new VertexBuffer(context, name + 'VBO');
    }

    public initialize(): boolean {
        let valid = this._VAO.initialize() && this._VBO.initialize();
        valid = valid && this._initialize();
        return valid;
    }

    public uninitialize(): void {}

    public get context(): WebGLContext {
        return this._VAO.context;
    }

    protected abstract _initialize(): boolean;

    public abstract render(): void;

    public bind(): void {
        this._VAO.bind();
    }

    public unbind(): void {
        this._VAO.unbind();
    }
}