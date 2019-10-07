import { Mat, Vec3, toRad } from "../maths";
import { Geometry } from "../geometry";
import { Material } from "./material";
import { TimeStep } from "../utils/timestep";
import { Quaternion } from "../maths/linearAlgebra/quaternion";
import { float } from "../utils/types";

export abstract class Component {
    protected _type: string;

    constructor(type: string) {
        this._type = type;
    }

    public get type(): string {
        return this._type;
    }
}

export class TransformComponent extends Component {
    protected _transform: Mat = Mat.Identity;
    protected _position: Vec3 = Vec3.Zeros;
    protected _rotationQuaternion: Quaternion = new Quaternion();
    protected _scale: Vec3 = new Vec3(1, 1, 1);


    constructor();
    constructor(position: Vec3);
    constructor(transform: Mat);
    constructor(position?: Mat | Vec3) {
        super('transform');
        if (position instanceof Mat)
            this._transform = position;
        else {
            if (position instanceof Vec3) {
                this._position.from(position);
            }
            this._computeTransform();
        }
    }

    public set scale(scale: Vec3) {
        this._scale.from(scale);
    }

    public rotate(angle: float, axis: 'X' | 'Y' | 'Z'): void {
        let rotation: Quaternion;
        switch (axis) {
            case 'X': rotation = Quaternion.RotationYawPitchRoll(0, angle, 0); break;
            case 'Y': rotation = Quaternion.RotationYawPitchRoll(angle, 0, 0); break;
            case 'Z': rotation = Quaternion.RotationYawPitchRoll(0, 0, angle); break;
        }
        this._rotationQuaternion.from(rotation!.multiply(this._rotationQuaternion));
    }

    public rotateDeg(angle: float, axis: 'X' | 'Y' | 'Z'): void {
        return this.rotate(toRad(angle), axis);
    }

    public get transform(): Mat {
        return this._computeTransform();
    }

    protected _computeTransform(): Mat {
        return this._transform.from(Mat.multiply(Mat.Translation(this._position), Mat.multiply(Mat.from(this._rotationQuaternion), Mat.Scale(this._scale))));
    }

    public onUpdate(timestep: TimeStep): void {
    }
}

export class GeometryComponent extends Component {
    protected _geometry!: Geometry;
    protected _material!: Material;

    constructor() {
        super('geometry');
    }

    public get geometry(): Geometry {
        return this._geometry;
    }

    public set geometry(geometry: Geometry) {
        this._geometry = geometry;
    }

    public get material(): Material {
        return this._material;
    }

    public set material(material: Material) {
        this._material = material;
    }
}