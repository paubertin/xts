import { Entity } from "./entity";
import { Shader } from "../gl/shaders/shader";
import { Mat } from "../maths";
import { OrthographicCamera } from "../cameras/orthographicCamera";
import { Engine } from '../application/engine';
import { RootNode } from './rootNode';
import * as std from 'tstl';
import { ISceneNode } from "./iSceneNode";
import { Logger } from "../utils/log";
import { Renderer2D } from '../graphics/renderer2d';
import { TimeStep } from "../utils/timestep";
import { IRenderable } from "./renderable";
import { Canvas } from "../application/canvas";

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

export interface IScene {
    initialize(): void;
    onUpdate(step: TimeStep): void;
    onRender(): void;
}

export class Scene implements IScene {
    protected _canvas: Canvas;
    protected _renderables: IRenderable[] = [];

    constructor(canvas: Canvas) {
        this._canvas = canvas;
    }

    public add(renderable: IRenderable): void {
        this._renderables
    }

    public initialize(): void {
        this._renderables.forEach((renderable) => renderable.initialize());
    }

    public onUpdate(step: TimeStep): void {
        this._renderables.forEach((renderable) => renderable.onUpdate(step));
    }

    public onRender(): void {
        this._renderables.forEach((renderable) => renderable.onRender());
    }

}