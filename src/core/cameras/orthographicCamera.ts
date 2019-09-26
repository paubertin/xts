import { Camera } from "./camera";
import { Mat } from "src/core/maths";

export class OrthographicCamera extends Camera {
    constructor(projection: Mat) {
        super(projection);
    }

    public focus(): void {}
    public update(): void {
        
    }
}