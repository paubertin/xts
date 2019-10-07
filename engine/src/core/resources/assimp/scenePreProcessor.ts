import { Nullable } from "src/core/utils/types";
import { aiScene } from "./scene";

export class ScenePreProcessor {
    private _scene: Nullable<aiScene>;
    constructor(scene: Nullable<aiScene>) {
        this._scene = scene;
    }

    public processScene(): void {
        // TODO
    }
}