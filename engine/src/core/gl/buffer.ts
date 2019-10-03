import { WebGLObject } from "./glObject";
import { WebGLContext } from "./webglContext";
import { Logger } from "../utils/log";

export abstract class Buffer extends WebGLObject<WebGLBuffer> {
    protected _target: GLenum | undefined;

    protected constructor(context: WebGLContext, target: GLenum, name?: string) {
        super(context, name);
        const gl = context.gl;
        this._target = target;
    }

    protected _initialize(): boolean {
        this._handle = this._context.gl.createBuffer();
        this._valid = this._handle !== null;
        return this._valid;
    }

    protected _delete(): void {
        if (this._handle === undefined) return;
        this._context.gl.deleteBuffer(this._handle);
        delete this._handle;
        this._valid = false;
        this._target = undefined;
    }

    public bind(): void {
        Logger.assert(this._target !== undefined);
        this._context.gl.bindBuffer(this._target!, this._handle);
    }

    public unbind(): void {
        Logger.assert(this._target !== undefined);
        this._context.gl.bindBuffer(this._target!, null);
    }

    public pushData(data: ArrayBuffer, usage: GLenum): void {
        Logger.assert(this._target !== undefined);
        const gl = this._context.gl;
        // this.bind();
        gl.bufferData(this._target!, data, usage);
        // this.unbind();

        this._valid = gl.isBuffer(this._handle) && gl.getError() === gl.NO_ERROR;
    }

    public get target(): GLenum | undefined {
        return this._target;
    }

    public enableAttrib(index: GLuint, size: GLint, type: GLenum,
        normalized: GLboolean = false, stride: GLsizei = 0, offset: GLint = 0): void {
        // this.bind();
        this._context.gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
        this._context.gl.enableVertexAttribArray(index);
        // this.unbind();
    }
}

export class VertexBuffer extends Buffer {
    constructor(context: WebGLContext, name?: string) {
        super(context, context.gl.ARRAY_BUFFER, name);
    }
}

export class IndexBuffer extends Buffer {
    constructor(context: WebGLContext, name?: string) {
        super(context, context.gl.ELEMENT_ARRAY_BUFFER, name);
    }
}