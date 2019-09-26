import { Entity } from "../scene/entity";
import { Shader } from "../gl/shaders/shader";

export interface IComponent {
    type: string;

    readonly owner: Entity;

    load(): void;

    update(time: number): void;

    render(shader: Shader): void;
}