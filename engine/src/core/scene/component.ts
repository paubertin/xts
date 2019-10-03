import { Mat, Vec3 } from "../maths";
import { Geometry } from "../geometry";
import { Material } from "./material";
import { TimeStep } from "../utils/timestep";

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
    protected _transform!: Mat;

    constructor();
    constructor(position: Vec3);
    constructor(transform: Mat);
    constructor(position?: Mat | Vec3) {
        super('transform');
        if (position instanceof Mat)
            this._transform = position;
        else if (position instanceof Vec3) {
            this._transform = Mat.Translation(position);
        }
        else {
            this._transform = Mat.Identity;
        }
    }

    public get transform(): Mat {
        return this._transform;
    }

    public update(timestep: TimeStep): void {
        
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