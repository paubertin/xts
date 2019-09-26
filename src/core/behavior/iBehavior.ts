import { Entity } from "../scene/entity";

export interface IBehavior {
    type: string;

    readonly owner: Entity;

    update(time: number): void;
}