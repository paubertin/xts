import { TimeStep } from "../utils/timestep";

export interface IRenderable {
    initialize(): void;
    onUpdate(step: TimeStep): void;
    onRender(): void;
}

export abstract class Renderable implements IRenderable {
    constructor () {

    }

    public abstract initialize(): void;

    public abstract onUpdate(step: TimeStep): void;

    public abstract onRender(): void;
}