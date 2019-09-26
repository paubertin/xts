import { Mat, Vec3 } from '../maths';

export abstract class Camera {
    protected _projectionMatrix: Mat;
    protected _viewMatrix: Mat = Mat.Identity;
    protected _position: Vec3 = new Vec3();
    protected _rotation: Vec3 = new Vec3();
    protected _focalPoint!: Vec3;

    constructor(projectionMatrix: Mat) {
        this._projectionMatrix = projectionMatrix.clone();
    }

    public abstract focus(): void;
    public abstract update(): void;

    public get position(): Vec3 {
        return this._position;
    }

    public set position(position: Vec3) {
        this._position = position.clone();
    }

    public get rotation(): Vec3 {
        return this._rotation;
    }

    public set rotation(rotation: Vec3) {
        this._rotation = rotation.clone();
    }

    public get projectionMatrix(): Mat {
        return this._projectionMatrix;
    }

    public set projectionMatrix(projectionMatrix: Mat) {
        this._projectionMatrix = projectionMatrix.clone();
    }

    public translate(translation: Vec3): void {
        this._position.add(translation);
    }

    public rotate(rotation: Vec3): void {
        this._rotation.add(rotation);
    }

    public get focalPoint(): Vec3 {
        return this._focalPoint;
    }

    public get viewMatrix(): Mat {
        return this._viewMatrix;
    }
}