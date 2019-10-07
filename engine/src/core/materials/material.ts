import { int } from "../utils/types";

export interface IMaterial {
    clone(): IMaterial;
    name: string;
}

export class Material implements IMaterial {
    public name: string = 'default';
    public vertexColors: int = 0;
    constructor() {

    }

    public clone(): IMaterial {
        return new Material();
    }
}