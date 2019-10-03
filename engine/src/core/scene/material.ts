import { Shader } from "../gl/shaders/shader";
import { IEventHandler } from "../events/iEventHandler";
import { Event } from "../events/event";

export abstract class Material implements IEventHandler {
    protected _name: string;
    protected _shader: Shader;

    constructor(name: string, shader: Shader) {
        this._name = name;
        this._shader = shader;
    }

    public get shader(): Shader {
        return this._shader;
    }

    public abstract bind(): void;
    public abstract unbind(): void;

    public abstract onEvent(event: Event): void;
}