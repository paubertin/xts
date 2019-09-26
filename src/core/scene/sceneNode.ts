import { ISceneNode } from "./iSceneNode";
import { Vec3, Mat, Vec2 } from "../maths";
import { Scene2D } from './scene';
import * as std from 'tstl';
import { Logger } from "../utils/log";
import { Material } from "../graphics/material";
import { IRenderer2D } from "../graphics/renderer2d";
import { TimeStep } from "../utils/timestep";

type List<T> = std.List<T>;

export class SceneNode implements ISceneNode {
    protected _model!: Mat;
    protected _world!: Mat;
    protected _material!: Material;
    protected _children: List<SceneNode> = new std.List<SceneNode>();
    protected _parent: SceneNode | undefined;

    constructor(protected _objectId: number,
        protected _name: string,
        protected _position: Vec2,
        protected _depth: number = 0,
        protected _scale: Vec2 = Vec2.One,
        protected _rotation: number = 0) {
        this.calculateModel();
    }

    public get objectId(): number {
        return this._objectId;
    }

    public set objectId(objectId: number) {
        this._objectId = objectId;
    }

    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    public get material(): Material {
        return this._material;
    }

    public set material(material: Material) {
        this._material = material;
    }

    public get depth(): number {
        return this._depth;
    }

    public set depth(depth: number) {
        this._depth = depth;
        this.calculateModel();
    }

    public get model(): Mat {
        return this._model;
    }

    public get position(): Vec2 {
        return this._position;
    }

    public get rotation(): number {
        return this._rotation;
    }

    public get scale(): Vec2 {
        return this._scale;
    }

    public set position(position: Vec2) {
        this.position = position.clone();
        this.calculateModel();
    }

    public set rotation(rotation: number) {
        this._rotation = rotation;
        this.calculateModel();
    }

    public set scale(scale: Vec2) {
        this._scale = scale;
        this.calculateModel();
    }

    public calculateModel(): void {
        let model = Mat.Identity;
        model = Mat.Translate(model, new Vec3(this._position, -this._depth));

        model = Mat.Translate(model, new Vec3(0.5 * this._scale.x, 0.5 * this._scale.y, 0));
        model = Mat.Rotate(model, Vec3.Z, this._rotation);
        model = Mat.Translate(model, new Vec3(-0.5 * this._scale.x, -0.5 * this._scale.y, 0));

        model = model.multiply(Mat.Scale(new Vec3(this._scale, 1)));
        this._model = model;
    }

    public initialize(scene: Scene2D): void {
        let itChild = this._children.begin();
        while (itChild !== this._children.end()) {
            itChild.value.initialize(scene);
            itChild = itChild.next();
        }
    }

    public restore(scene: Scene2D): void {
        let itChild = this._children.begin();
        while (itChild !== this._children.end()) {
            itChild.value.restore(scene);
            itChild = itChild.next();
        }
    }

    public update(scene: Scene2D, delta: TimeStep): void {
        if (this._parent) {
            this._world = this._model.clone();

//             this._world = this._parent._model.multiply(this._model);
        }
        else {
            this._world = this._model.clone();
        }
        let itChild = this._children.begin();
        while (itChild !== this._children.end()) {
            itChild.value.update(scene, delta);
            itChild = itChild.next();
        }
    }

    // TODO => manage camera
    public isVisible(scene: Scene2D): boolean {
        return true;
    }

    public preRender(scene: Scene2D): void {
        // scene.pushAndSetMatrix(this._model);
    }

    public render(scene: Scene2D, renderer: IRenderer2D): void {

    }

    public postRender(scene: Scene2D): void {
        // scene.popMatrix();
    }

    public getChild(objectId: number): SceneNode | undefined {
        let itChild = this._children.begin();
        while (itChild !== this._children.end()) {
            if (itChild.value._objectId === objectId) {
                return itChild.value;
            }
            itChild = itChild.next();
        }
        return undefined;
    }

    public addChild(child: ISceneNode): void {
        if (this.getChild(child.objectId)) {
            return;
        }
        this._children.push_back(<SceneNode>child);
        (<SceneNode>child)._parent = this;
    }

    public removeChild(objectId: number): void {
        let itChild = this._children.begin();
        while (itChild !== this._children.end()) {
            if (itChild.value._objectId === objectId) {
                itChild.value._parent = undefined;
                itChild = this._children.erase(itChild);
                return;
            }
            itChild = itChild.next();
        }
        Logger.warn(`Could not remove child ${objectId} from parent '${this._objectId}'.`)
    }

    public renderChildren(scene: Scene2D, renderer: IRenderer2D): void {
        let itChild = this._children.begin();
        while (itChild !== this._children.end()) {
            const child = itChild.value;
            child.preRender(scene);
            if (child.isVisible) {
                child.render(scene, renderer);
                child.renderChildren(scene, renderer);
            }
            child.postRender(scene);
            itChild = itChild.next();
        }
    }

    public getChildren(): List<ISceneNode> {
        return this._children;
    }
}