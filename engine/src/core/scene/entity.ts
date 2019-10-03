import { Vec2 } from '../maths/linearAlgebra/vector';
import { BaseComponent } from '../components/baseComponent';
import { BaseBehavior } from '../behavior/baseBehavior';

export class Entity {
    private _id!: number;
    
    private _position: Vec2 = Vec2.Zero;
    private _scale: Vec2 = Vec2.One;
    private _rotation: number = 0;
    private _depth: number = 0;
    private _components: BaseComponent[] = [];
    private _behaviors: BaseBehavior[] = [];

    constructor(private _name: string) {

    }

    public get depth(): number {
        return this._depth;
    }

    public set depth(depth: number) {
        this._depth = depth;
    }

    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    public get id(): number {
        return this._id;
    }

    public set id(id: number) {
        this._id = id;
    }

    public set position(position: Vec2) {
        this._position = position;
    }

    public get position(): Vec2 {
        return this._position;
    }

    public set scale(scale: Vec2) {
        this._scale = scale;
    }

    public get scale(): Vec2 {
        return this._scale;
    }

    public set rotation(rotation: number) {
        this._rotation = rotation;
    }

    public get rotation(): number {
        return this._rotation;
    }

    public setGeometryFromJson(geometry: any): void {
        if (geometry.position) {
            if (geometry.position.x) {
                this._position.x = geometry.position.x;
            }
            if (geometry.position.y) {
                this._position.y = geometry.position.y;
            }
            if (geometry.scale.x) {
                this._scale.x = geometry.scale.x;
            }
            if (geometry.scale.y) {
                this._scale.y = geometry.scale.y;
            }
            if (geometry.rotation) {
                this._rotation = geometry.rotation * Math.PI / 180;
            }
        }
    }

    public addComponent(component: BaseComponent): void {
        component.owner = this;
        this._components.push(component);
    }

    public addBehavior(behavior: BaseBehavior): void {
        behavior.owner = this;
        this._behaviors.push(behavior);
    }
}

/*
export class EEntity extends SimObject {
    private _transform: Transform = new Transform();
    private localMatrix: Mat4 = Mat.Identity(4);
    private _worldMatrix: Mat4 = Mat.Identity(4);
    private _scene!: IScene2D;
    private _components: BaseComponent[] = [];
    private _behaviors: BaseBehavior[] = [];

    constructor(name: string, scene?: IScene2D) {
        super(name);
        if (scene) {
            this._scene = scene;
        }
    }

    public setPosition(x: number, y: number, z?: number): void;
    public setPosition(position: [number, number, number]): void;
    public setPosition(position: Vec3): void;
    public setPosition(position: Vec3 | [number, number, number] | number, y?: number, z?: number): void {
        if (position instanceof Vec3) {
            this._transform.position = position;
        }
        else if (typeof position === 'number') {
            if (z === undefined) {
                this._transform.position.x = position;
                this._transform.position.y = y as number;
            }
            else {
                this._transform.position.x = position;
                this._transform.position.y = y as number;
                this._transform.position.z = z;
            }
        }
        else {
            this._transform.position = new Vec3(position);
        }
    }

    public setTransformFromJson(jsonTransform: any): void {
        this._transform.setFromJson(jsonTransform);
    }

    public setScale(scale: number): void {
        this._transform.setScale(scale);
    }

    public setRotationZ(angle: number): void {
        this._transform.rotation.z = angle;
    }

    public setRotation(rotation: Vec3): void {
        this._transform.rotation = rotation;
    }

    public get transform(): Transform {
        return this._transform;
    }

    public get worldMatrix(): Mat4 {
        return this._worldMatrix;
    }

    public update(time: number): void {
        this.localMatrix = this.transform.calculateModel();
        this.updateWorldMatrix();

        for (let component of this._components) {
            component.update(time);
        }

        for (let behavior of this._behaviors) {
            behavior.update(time);
        }

        for (let child of this._children) {
            (<EEntity>child).update(time);
        }
    }

    public render(shader: Shader): void {
        for (let component of this._components) {
            component.render(shader);
        }
        for (let child of this._children) {
            (<EEntity>child).render(shader);
        }
    }

    public load (): void {
        this._isLoaded = true;

        for (let component of this._components) {
            component.load();
        }

        for (let child of this._children) {
            (<EEntity>child).load();
        }
    }

    public addComponent(component: BaseComponent): void {
        component.owner = this;
        this._components.push(component);
    }

    public addBehavior(behavior: BaseBehavior): void {
        behavior.owner = this;
        this._behaviors.push(behavior);
    }

    protected onAdded(): void {
        super.onAdded();
        this._scene = (<EEntity>this._parent)._scene;
    }

    private updateWorldMatrix(): void {
        if (this._parent) {
            this._worldMatrix = (<Entity>this._parent)._worldMatrix.multiply(this.localMatrix);
        }
        else {
            this._worldMatrix = this.localMatrix.clone();
        }
    }
}
*/