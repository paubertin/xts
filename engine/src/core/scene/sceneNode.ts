import { Component, GeometryComponent, TransformComponent } from "./component";
import { IScene } from "./scene";
import { IEngine } from "../application/engine";
import { Mat } from "../maths";
import { Nullable } from "../utils/types";

export interface ISceneNode {
    onRender(): void;
    readonly parent: SceneNode | undefined;
}

export interface INodeCache {
    parent?: ISceneNode;
}

export type SceneNodeConstructor = (name: string, scene: IScene, options?: any) => () => SceneNode;

export class SceneNode implements ISceneNode {

    private static _constructors: Map<string, any> = new Map<string, any>();

    public static AddConstructor(type: string, constructor: SceneNodeConstructor): void {
        this._constructors.set(type, constructor);
    }

    public static Create(type: string, name: string, scene: IScene, options?: any): Nullable<() => SceneNode> {
        let constructor = this._constructors.get(type);

        if (!constructor) return null;

        return constructor(name, scene, options);
    }

    protected _name: string;
    protected _id!: number;
    protected _parent: SceneNode | undefined = undefined;
    protected _parentUpdateId: number = -1;
    protected _childUpdateId: number = -1;
    protected _children: SceneNode[] = new Array<SceneNode>();
    protected _components: Component[] = new Array<Component>();

    protected _worldMatrix: Mat = Mat.Identity;

    protected _scene!: IScene;

    protected _cache!: INodeCache;

    constructor(name: string, scene: IScene, parent?: SceneNode, add: boolean = true) {
        this._name = name;
        this._scene = scene;
        this._id = this._scene.getUniqueId();
        if (parent) {
            parent.addChild(this);
        }
        if (add) this._scene.add(this);

        this._initCache();
    }

    public get scene(): IScene {
        return this._scene;
    }

    public addChild(node: SceneNode): SceneNode {
        node._parent = this;
        this._children.push(node);
        return node;
    }

    public addComponent(component: Component): Component {
        this._components.push(component);
        return component;
    }

    public getComponents(type?: string): Component[] {
        if (type) {
            return this._components.filter((component) => component.type === type);
        }
        return this._components;
    }

    public get name(): string {
        return this._name;
    }

    public get parent(): SceneNode | undefined {
        return this._parent;
    }

    public get children(): SceneNode[] {
        return this._children;
    }

    protected _initCache(): void {
        this._cache = {};
        this._cache.parent = undefined;
    }

    protected updateCache(force: boolean = false): void {
        if (!force && this.isSync())
            return;
        
        this._cache.parent = this._parent;
        this._updateCache();
    }

    protected _updateCache(): void {

    }

    protected _markSyncedWithParent(): void {
        if (this._parent)
            this._parentUpdateId = this._parent._childUpdateId;
    }

    protected _isSyncWithParent(): boolean {
        if (!this._parent)
            return true;
        
        if (this._parentUpdateId !== this._parent._childUpdateId)
            return false;
    
        return this._parent.isSync();
    }

    public isSync(): boolean {
        if (this._cache.parent !== this._parent) {
            this._cache.parent = this._parent;
            return false;
        }

        if (this._parent && !this._isSyncWithParent())
            return false;

        return this._isSync();
    }

    protected _isSync(): boolean {
        return true;
    }

    protected _getEngine(): IEngine {
        return this._scene.engine;
    }

    public computeWorldMatrix(): Mat {
        const transformComponent = this.getComponents('transform');
        // assert length <= 1
        let transform;
        if (transformComponent.length) {
            transform = (<TransformComponent>(transformComponent[0])).transform;
        }
        else {
            transform = Mat.Identity;
        }
        if (this._parent) {
            this._worldMatrix = Mat.multiply(this._parent.getWorldMatrix(), transform);
        }
        else {
            this._worldMatrix = transform;
        }
        return this._worldMatrix;
    }

    public getWorldMatrix(): Mat {
        this.computeWorldMatrix();
        return this._worldMatrix;
    }

    public onRender(): void {

        this.getComponents('geometry').forEach((component) => {
            const geometryComponent = component as GeometryComponent;
            const material = geometryComponent.material;
            const geometry = geometryComponent.geometry;

            if (!material.shader.loaded) return;
            geometry.bind();
            material.bind();

            const camera = this._scene.camera;

            material.shader.setUniformMatrix4fv('model', this.getWorldMatrix());
            material.shader.setUniformMatrix4fv('view', camera.getViewMatrix());
            material.shader.setUniformMatrix4fv('projection', camera.getProjectionMatrix());

            geometry.render();

            material.unbind();
            geometry.unbind();
        });

        this._children.forEach((child) => child.onRender());
    }
}