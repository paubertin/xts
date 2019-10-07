import { TimeStep } from "../utils/timestep";
import { IRenderable } from "./renderable";
import { Canvas } from "../application/canvas";
import { IEngine } from "../application/engine";
import { Observable } from "../utils/observable";
import { KeyBoardInfo } from "../events/keyboardEvent";
import { ISceneNode, SceneNode } from "./sceneNode";
import { TransformComponent } from "./component";
import { Mat } from "../maths";
import { Nullable } from "../utils/types";
import { Camera } from "../cameras/camera";
import { SkyBox } from "./skybox";
import { WebGLContext } from "../gl/webglContext";

/*
export interface IScene2D {

}

export class Scene2D implements IScene2D {
    protected _scenePath!: string;
    protected _camera: OrthographicCamera;
    protected _objectMap: std.HashMap<number, ISceneNode> = new std.HashMap<number, ISceneNode>();
    private _root: RootNode;
    private _renderer: Renderer2D;

    constructor(protected _engine: Engine) {
        this._root = new RootNode();
        const width = this._engine.window.width;
        const height = this._engine.window.height;
        const aspectRatio = width / height;

        Logger.debug('width', width);
        Logger.debug('height', height);

        // const matrix = Mat.Orthographic(
        //     -10 * aspectRatio, 10* aspectRatio,
        //     -10, 10,
        //     -1, 1);
        const matrix = Mat.Orthographic(0, width, height, 0, -10.0, 10.0);
        this._camera = new OrthographicCamera(matrix);
        this._renderer = new Renderer2D();
    }

    public set scenePath(path: string) {
        this._scenePath = path;
    }

    public get camera(): OrthographicCamera {
        return this._camera;
    }

    public get root(): RootNode {
        return this._root;
    }

    public initialize(): void {
        this._root.initialize(this);
        this._renderer.initialize();
    }

    public clear(): void {
        this._root = new RootNode();
        this._objectMap.clear();
    }

    public restore(): void {
        if (this._root) {
            this._root.restore(this);
        }
        if (this._camera) {
            const width = this._engine.window.width;
            const height = this._engine.window.height;
            const aspectRatio = width / height;
            this._camera.projectionMatrix = Mat.Orthographic(
                -10 * aspectRatio, 10* aspectRatio,
                -10, 10,
                -1, 1);
        }
    }

    public getSceneNode(objectId: number): ISceneNode | undefined {
        const it = this._objectMap.find(objectId);
        if (it === this._objectMap.end()) return undefined;
        return it.second;
    }

    public addChild(objectId: number, child: ISceneNode): void {
        const it = this.getSceneNode(objectId);
        if (it) {
            Logger.warn(`Child ${objectId} is already in the list.`);
            return;
        }
        this._objectMap.set(objectId, child);
        this._root.addChild(child);
    }

    public removeChild(objectId: number): void {
        const it = this.getSceneNode(objectId);
        if (!it) {
            Logger.warn(`Child ${objectId} is not in the list.`);
            return;
        }
        this._objectMap.erase(objectId);
        this._root.removeChild(objectId);
    }

    public update(step: TimeStep): void {
        if (!this._root) return;
        this._root.update(this, step);
    }

    public render(): void {
        if (this._root) {
            if (this._camera) {

                const width = this._engine.window.width;
                const height = this._engine.window.height;
                const matrix = Mat.Orthographic(0, width, height, 0, -10.0, 10.0);
                this._camera.projectionMatrix = matrix;
            }
            this._root.render(this, this._renderer);
        }
    }
}
*/

export interface IScene {
    readonly engine: IEngine;
    getUniqueId(): number;
    initialize(): void;
    onUpdate(step: TimeStep): void;
    onRender(): void;
    add(node: ISceneNode): void;
    addCamera(camera: Camera): void;

    readonly camera: Camera;
    readonly context: WebGLContext;
}

export class Scene implements IScene {
    private _uniqueIdCounter: number = 0;

    protected _engine: IEngine;
    protected _renderables: IRenderable[] = [];
    protected _nodes: ISceneNode[] = [];

    private _rootNode: SceneNode;
    private _skyBox: Nullable<SkyBox> = null;

    private _context: WebGLContext;

    private _mainCamera!: Nullable<Camera>;

    constructor(engine: IEngine) {
        this._engine = engine;
        this._context = engine.context;
        this._rootNode = new SceneNode('__ROOT__', this, undefined, false);
        this._rootNode.addComponent(new TransformComponent(Mat.Identity));
    }

    public get context(): WebGLContext {
        return this._context;
    }

    public add(node: SceneNode): void {
        if (node instanceof SkyBox) {
            this._skyBox = node;
        }
        else if (node.parent === undefined) {
            this._rootNode.addChild(node);
        }
    }

    public get camera(): Camera {
        return this._mainCamera!;
    }

    public addCamera(camera: Camera): void {
        this._mainCamera = camera;
    }

    public initialize(): void {
        this._renderables.forEach((renderable) => renderable.initialize());
    }

    public onUpdate(step: TimeStep): void {
        this._rootNode.onUpdate(step);
        // this._renderables.forEach((renderable) => renderable.onUpdate(step));
    }

    public onRender(): void {
        this._rootNode.onRender();
        if (this._skyBox) this._skyBox.onRender();
    }

    public getUniqueId(): number {
        const result = this._uniqueIdCounter;
        this._uniqueIdCounter++;
        return result;
    }

    public get engine(): IEngine {
        return this._engine;
    }

}