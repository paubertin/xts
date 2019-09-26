import { IAssetLoader } from "./iAssetLoader";
import * as std from 'tstl';
import { IAsset } from "./iAsset";
import { EventManager } from "../events/eventManager";
import { Logger } from "../utils/log";
import { ImageLoader } from "./imageLoader";
import { JsonLoader } from "./jsonLoader";
import { MapLoader } from "./mapLoader";
import { Scene2D } from "../scene/scene";
import { EVENTS } from "../events/event";

export class AssetManager {

    public static sanitizePath(path: string): string {
        return path.startsWith('assets/') ? path : 'assets/' + path;
    }

    public static init(): void {
        if (AssetManager._instance) {
            throw new Error('AssetManager already instanciated');
        }
        AssetManager._instance = new AssetManager();
        AssetManager._instance._loaders.push(new ImageLoader());
        AssetManager._instance._loaders.push(new JsonLoader());
    }

    public static registerLoader(loader: IAssetLoader): void {
        this.instance._loaders.push(loader);
    }

    public static onAssetLoaded(asset: IAsset): void {
        AssetManager.instance._assets.set(AssetManager.sanitizePath(asset.name), asset);
        EventManager.post(EVENTS.ASSET_LOADED + AssetManager.sanitizePath(asset.name), this, asset);
    }

    public static loadMap(scene: Scene2D, path: string, levelScale: number = 0.5) {
        AssetManager.instance._mapLoader.loadMap(scene, path, levelScale);
    }

    public static load(name: string): void {
        const ext = (<string>(AssetManager.sanitizePath(name).split('.').pop())).toLowerCase();
        for (let loader of AssetManager.instance._loaders) {
            if (loader.supportedExtensions.includes(ext)) {
                loader.loadAsset(AssetManager.sanitizePath(name));
                return;
            }
        }
        Logger.warn(`Unable to load asset with extension ${ext}, there is no loader associated.`);
    }

    public static has(name: string): boolean {
        return this.instance._assets.has(AssetManager.sanitizePath(name));
    }

    public static get(name: string): IAsset | undefined {
        if (AssetManager.has(AssetManager.sanitizePath(name))) {
            return this.instance._assets.get(AssetManager.sanitizePath(name));
        }
        AssetManager.load(AssetManager.sanitizePath(name));
        return undefined;
    }

    /*
        Private
    */
    private static _instance: AssetManager;
    private _loaders: IAssetLoader[] = [];
    private _assets: std.HashMap<string, IAsset> = new std.HashMap<string, IAsset>();
    private _mapLoader: MapLoader = new MapLoader();

    private constructor() {}

    private static get instance(): AssetManager {
        if (!AssetManager._instance) {
            throw new Error('AssetManager not instanciated');
        }
        return AssetManager._instance;
    }

}