import { Entity } from "../scene/entity";
import { IBehavior } from "./iBehavior";

export abstract class BaseBehavior implements IBehavior {
    protected _owner!: Entity;

    constructor(public type: string) {
    }

    public get owner(): Entity {
        return this._owner;
    }

    public set owner(owner: Entity) {
        this._owner = owner;
    }

    public update(time: number): void {

    }
}