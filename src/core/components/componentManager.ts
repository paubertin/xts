import { IComponent } from "./iComponent";
// import { SpriteComponent } from "./spriteComponent";
import { Engine } from '../application/engine';

export class ComponentManager {

    public static init(engine: Engine): void {
        if (ComponentManager._instance) {
            throw new Error('ComponentManager already instanciated');
        }
        ComponentManager._instance = new ComponentManager(engine);
    }

    public static extractComponent(jsonData: any): IComponent | undefined {
        let type = jsonData.type;
        if (type === undefined) {
            throw new Error('Missing component type...');
        }
        let component;
        switch (type) {
            case 'sprite': {
                if (jsonData.material === undefined) {
                    throw new Error('Missing material...');
                }
                let params = {
                    materialName: jsonData.material,
                    width: jsonData.width !== undefined ? Number(jsonData.width) : undefined,
                    height: jsonData.height !== undefined ? Number(jsonData.height) : undefined,
                };
                // component = new SpriteComponent(ComponentManager.instance.engine, params);
                break;
            }
            default: break;
        }
        return component;
    }

    /*
        Private
    */
    private static _instance: ComponentManager;

    private constructor(private engine: Engine) {}

    private static get instance(): ComponentManager {
        if (!ComponentManager._instance) {
            throw new Error('ComponentManager not instanciated');
        }
        return ComponentManager._instance;
    }

}