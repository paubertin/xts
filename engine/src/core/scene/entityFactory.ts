import { Engine } from "../application/engine";
import { Entity } from "./entity";

export class EntityFactory {
    private static COUNT: number = 0;

    public static init(engine: Engine): void {
        if (EntityFactory._instance) {
            throw new Error('EntityFactory already instanciated');
        }
        EntityFactory._instance = new EntityFactory(engine);
    }

    public static createEntity(name: string): Entity {
        let entity = new Entity(name);
        entity.id = EntityFactory.COUNT++;
        return entity;
    }

    /*
        Private
    */
    private static _instance: EntityFactory;

    private constructor(public engine: Engine) {}

    private static get instance(): EntityFactory {
        if (!EntityFactory._instance) {
            throw new Error('EntityFactory not instanciated');
        }
        return EntityFactory._instance;
    }
}