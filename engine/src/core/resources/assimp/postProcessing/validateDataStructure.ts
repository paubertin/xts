import { BaseProcess } from "../baseProcess";
import { Nullable, int } from "src/core/utils/types";
import { aiScene } from "../scene";
import { aiPostProcessSteps } from "./postprocess";

export class ValidateDSProcess extends BaseProcess {
    constructor() {
        super();
    }

    public isActive(flags: int): boolean {
        return (flags & aiPostProcessSteps.ValidateDataStructure) !== 0;
    }

    public execute(scene: Nullable<aiScene>): void {
        // TODO;
    }
}