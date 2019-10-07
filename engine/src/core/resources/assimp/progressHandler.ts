import { float, int } from "src/core/utils/types";

export abstract class ProgressHandler {
    protected constructor() {}

    public abstract update(percentage: float): boolean;

    public updateFileRead(currentStep: int, numOfSteps: int): void {
        let f: float = numOfSteps ? currentStep / numOfSteps : 1.0;
        this.update(f * 0.5);
    }

    public updatePostProcess(currentStep: int, numOfSteps: int): void {
        let f: float = numOfSteps ? currentStep / numOfSteps : 1.0;
        this.update(f * 0.5 + 0.5);
    }

    public updateFileWrite(currentStep: int, numOfSteps: int): void {
        let f: float = numOfSteps ? currentStep / numOfSteps : 1.0;
        this.update(f * 0.5);
    }
}
export class DefaultProgressHandler extends ProgressHandler {
    constructor() {
        super();
    }

    public update(percentage: float = 1.0): boolean {
        return false;
    }

}