import { IOfflineProvider } from "./offlineProvider";
import { IAssetManagerStatic } from "./assetManager";

export interface IAssetLoader {
    readonly supportedExtensions: string[];
    loadAsset(name: string, offlineProvider?: IOfflineProvider): void;
}

export abstract class ALoader implements IAssetLoader {
    protected _serverUrl: string;
    constructor(protected _assetManager: IAssetManagerStatic) {
        this._serverUrl = require('../../config.json').server.url;
    }

    public abstract get supportedExtensions(): string[];

    public abstract loadAsset(name: string, offlineProvider?: IOfflineProvider): void;
}