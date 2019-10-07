import { Importer } from "./importer";
import { Nullable, int } from "src/core/utils/types";
import { aiScene } from "./scene";
import { Logger } from "src/core/utils/log";
import { ProgressHandler } from "./progressHandler";

type KeyType = int;


export abstract class BaseProcess {
    public constructor() {

    }

    public abstract isActive(flags: int): boolean;

    public requireVerboseFormat(): boolean { return true; }

    public executeOnScene(imp: Importer): void {
        Logger.assert(imp.impl.scene !== null);

        let progress = imp.progressHandler;
        Logger.assert(progress !== null);

        this.setupProperties(imp);

        try {
            this.execute(imp.impl.scene);
        }
        catch (err) {
            imp.impl.errorString = err.what();
            Logger.error(imp.impl.errorString);
            imp.impl.scene = null;
        }

    }

    public abstract execute(scene: Nullable<aiScene>): void;

    public setupProperties(imp: Importer): void {
        // does nothing here
    }

    public setSharedData(sh: Nullable<SharedPostProcessInfo>): void {
        this.shared = sh;
    }

    public get sharedData(): Nullable<SharedPostProcessInfo> {
        return this.shared;
    }

    protected shared: Nullable<SharedPostProcessInfo> = null;
    protected progress: Nullable<ProgressHandler> = null;
}

export class SharedPostProcessInfo {
    constructor() {}

    public clean(): void {
        // TODO
    }
}