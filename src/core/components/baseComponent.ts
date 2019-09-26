import { Entity } from "../scene/entity";
import { Shader } from "../gl/shaders/shader";
import { IComponent } from "./iComponent";

export abstract class BaseComponent implements IComponent {
    protected _owner!: Entity;

    constructor(public type: string) {
    }

    public get owner(): Entity {
        return this._owner;
    }

    public set owner(owner: Entity) {
        this._owner = owner;
    }

    public abstract load(): void;

    public update(time: number): void {

    }

    public render(shader: Shader): void {

    }

}