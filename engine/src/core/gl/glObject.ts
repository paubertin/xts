import { WebGLContext } from "./webglContext";
import { Initializable } from "../initializable";
import { uuid } from "../maths";
import { Logger } from "../utils/log";
import { Nullable } from "../utils/types";

export interface ID {
    readonly id: string;
}

export abstract class WebGLObject<T> implements ID {
    protected _context: WebGLContext;
    protected _name: string;
    protected _id!: string;
    protected _handle: Nullable<T> = null;
    protected _valid: GLboolean = false;
    protected _refCount: GLsizei = 0;

    constructor(context: WebGLContext, name?: string) {
        this._context = context;
        this._name = name ? name : 'Object';
    }

    protected abstract _initialize(...args: any[]): boolean;
    protected abstract _delete(): void;

    public initialize(...args: any[]): boolean {
        this._id = this._context.register(this);
        this._valid = this._initialize.apply(this, args);

        if (!this._valid) {
            Logger.error(`Initialization of ${this.constructor.name} '${this._id}' failed.`);
            this._context.unregister(this._id);
        }
        
        return this._valid;
    }

    public uninitialize(): void {
        this._context.unregister(this._id);
        this._delete();
    }

    public get context(): WebGLContext {
        return this._context;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get handle(): Nullable<T> {
        return this._handle;
    }

    public ref(): void {
        ++this._refCount;
    }

    public unref(): void {
        --this._refCount;
    }

}