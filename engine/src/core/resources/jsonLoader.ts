import { IAssetLoader } from "./iAssetLoader";
import { Logger } from "../utils/log";
import { AssetManager } from './assetManager';
import { IAsset } from "./iAsset";

export class JsonAsset implements IAsset {

    public constructor(private _name: string, private _data: any) {}

    public get name(): string {
        return this._name;
    }

    public get data(): any {
        return this._data;
    }
}

export class JsonLoader implements IAssetLoader {
    public get supportedExtensions(): string[] {
        return ['json'];
    }

    public loadAsset(name: string): void {
        let request: XMLHttpRequest = new XMLHttpRequest();
        request.open('GET', name);
        request.addEventListener('load', this.onJsonLoaded.bind(this, name, request));
        request.send();
    }

    private onJsonLoaded(name: string, request: XMLHttpRequest, event: ProgressEvent): void {
        Logger.info(`onJsonLoaded:`, name);
        if (request.readyState === request.DONE) {
            if (request.status !== 200) {
                Logger.error(`File '${name}' could not be loaded: ${request.statusText}`);
            }
            else {
                const asset = new JsonAsset(name, JSON.parse(request.responseText));
                AssetManager.onAssetLoaded(asset);
            }
        }
        request.removeEventListener('load', this.onJsonLoaded.bind(this, name, request));
    }
}