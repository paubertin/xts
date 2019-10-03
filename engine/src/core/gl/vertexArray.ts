import { WebGLObject } from "./glObject";
import { Nullable } from "../utils/types";

export class VertexArray extends WebGLObject<WebGLVertexArrayObject> {
    
    protected _eltCount: Nullable<GLint> = null;
    protected _bind!: () => void;
    protected _unbind!: () => void;

    protected _initialize(): boolean {
        this._handle = this._context.gl.createVertexArray();
        this._valid = this._handle !== null;
        return this._valid;
    }

    protected _delete(): void {
        this._context.gl.deleteVertexArray(this._handle);
        delete this._handle;
        this._valid = false;
    }

    public bind(): void {
        this.context.gl.bindVertexArray(this._handle);
    }

    public unbind(): void {
        this._context.gl.bindVertexArray(null);
    }

    public get eltCount(): Nullable<GLint> {
        return this._eltCount;
    }

    public set eltCount(value: Nullable<GLint>) {
        this._eltCount = value;
    }
}