import { Camera } from "./camera";
import { Nullable } from "../utils/types";
import { Logger } from "../utils/log";

export interface ICameraInput<TCamera extends Camera> {
    camera: Nullable<TCamera>;

    attachControl(preventDefault?: boolean): void;
    checkInputs?: () => void;

    getName(): string;
}

export class CameraInputManager<TCamera extends Camera> {
    public checkInputs: () => void;
    protected _camera: TCamera;
    protected _inputs: Map<string, ICameraInput<TCamera>> = new Map<string, ICameraInput<TCamera>>();

    constructor(camera: TCamera) {
        this._camera = camera;
        this.checkInputs = () => {};
    }

    protected add(input: ICameraInput<TCamera>): void {
        const type = input.getName();

        if (this._inputs.has(type)) {
            Logger.warn(`Camera inputManager already has '${type}'.`)
            return;
        }

        this._inputs.set(type, input);
        input.camera = this._camera;

        if (input.checkInputs)
            this.checkInputs = this._addCheckInput(input.checkInputs.bind(input));
    }

    private _addCheckInput(cb: () => void): () => void {
        const current = this.checkInputs;
        return () => {
            current();
            cb();
        };
    }

    public attachControl(): void {
        for (let input of this._inputs)
            input[1].attachControl();
    }

}