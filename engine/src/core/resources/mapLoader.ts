import { JsonAsset } from "./jsonLoader";
import { AssetManager } from "./assetManager";
import { EventManager } from "../events/eventManager";
import { EVENTS } from "../events/event";
import { IEventHandler } from "../events/iEventHandler";
import { Event } from '../events/event';
import { Logger } from "../utils/log";
import { SceneNode } from "../scene/sceneNode";
import { EntityFactory } from "../scene/entityFactory";
import { Material } from "../graphics/material";
import { ShaderManager } from "../gl/shaders/shaderManager";
// import { ComponentManager } from "../components/componentManager";
// import { BehaviorManager } from "../behaviors/behaviorManager";

export class MapLoader implements IEventHandler {
    protected _levelScale!: number;

    constructor() {

    }

    /*
    public loadMap(scene: Scene2D, mapPath: string, levelScale: number = 1.0): void {
        this._scene = scene;
        this._scene.scenePath = mapPath;
        this._levelScale = levelScale;
        if (AssetManager.has(mapPath)) {
            let asset = AssetManager.get(mapPath);
            this._load(<JsonAsset>asset);
        }
        else {
            EventManager.subscribe(EVENTS.ASSET_LOADED + mapPath, this);
            AssetManager.load(mapPath);
        }
    }
    */

    public onEvent(event: Event): void {
        if (event.code.startsWith(EVENTS.ASSET_LOADED)) {
            let asset = <JsonAsset>event.context;
            this._load(<JsonAsset>asset);
        }
    }

    private _load(asset: JsonAsset): void {
        const json = asset.data;

        this._processMapProperties(json);
        this._processObjects(json);
        // this._scene.initialize();
    }

    private _processMapProperties(json: any): void {

    }

    private _processObjects(json: any): void {
        if (json.objects) {
            if (!Array.isArray(json.objects)) {
                Logger.warn('Wrong format for objects in json file...');
                return;
            }
            for (let object of json.objects) {
                // this._processObject(object, this._scene.root);
            }
        }
    }

    private _processObject(object: any, parent?: SceneNode): void {
        let name: string;
        if (object.name === undefined) {
            throw new Error(`Object name not present in the json file.`);
        } else {
            name = String(object.name);
        }
        let entity = EntityFactory.createEntity(name);

        if (object.geometry) {
            entity.setGeometryFromJson(object.geometry);
        }

        /*
        let node = new SpriteNode(entity.id, entity.name, entity.position, entity.depth, entity.scale, entity.rotation);
        let material =  new Material(entity.name);
        material.shader = ShaderManager.get('sprite');

        if (object.texture) {
            if (object.texture.diffuse) {
                material.diffuseTextureName = object.texture.diffuse;
            }
        }
        node.material = material;

        const children = object.children;

        if (children) {
            if (!Array.isArray(children)) {
                Logger.warn('Wrong format for children in json file...');
            }
            else {
                for (let child of children) {
                    this._processObject(child, node);
                }
            }
        }

        const components = object.components;

        if (components) {
            if (!Array.isArray(components)) {
                Logger.warn('Wrong format for components in json file...');
            }
            else {
                for (let componentData of components) {
                    // const component = ComponentManager.extractComponent(componentData);
                    // if (component) {
                    //     entity.addComponent(component as any);
                    // }
                }
            }
        }

        const behaviors = object.behaviors;

        if (behaviors) {
            if (!Array.isArray(behaviors)) {
                Logger.warn('Wrong format for behaviors in json file...');
            }
            else {
                for (let behaviorData of behaviors) {
                    // const behavior = BehaviorManager.extractBehavior(behaviorData);
                    // if (behavior) {
                    //     entity.addBehavior(behavior as any);
                    // }
                }
            }
        }

        if (parent) {
            parent.addChild(node);
        }
        */
    }

}