import { IMaterial, Material } from "./material";

export class MaterialLoader {
    public constructor() {}

    public parse(json: any): IMaterial {
        return new Material();
    }
}