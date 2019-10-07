import { IAssetLoader } from "./iAssetLoader";
import * as std from 'tstl';
import { IAsset } from "./iAsset";
import { EventManager } from "../events/eventManager";
import { Logger } from "../utils/log";
import { ImageLoader } from "./imageLoader";
import { JsonLoader } from "./jsonLoader";
import { MapLoader } from "./mapLoader";
import { EVENTS } from "../events/event";
import { DataBase } from "./offlineProvider";
import { ShaderLoader } from "./shaderLoader";
import { Importer } from "./assimp/importer";
import { File } from "./file";
import { FileLoader } from "./fileLoader";
import { ObjLoader } from "./obj/objLoader";

function staticImplements<T>() {
    return (constructor: T) => {}
}

export interface IAssetManager {

}

export interface IAssetManagerStatic {
    onAssetLoaded(asset: IAsset, eventType?: EVENTS): void;
}
@staticImplements<IAssetManagerStatic>()
export class AssetManager {

    public static sanitizePath(path: string): string {
        return path.startsWith('assets/') ? path : 'assets/' + path;
    }

    public static init(): void {
        if (AssetManager._instance) {
            throw new Error('AssetManager already instanciated');
        }
        AssetManager._instance = new AssetManager();
        AssetManager._instance._loaders.push(new ImageLoader(this));
        AssetManager._instance._loaders.push(new JsonLoader(this));
        AssetManager._instance._loaders.push(new ShaderLoader(this));
        AssetManager._instance._loaders.push(new ObjLoader(this));
        AssetManager._instance._fileLoader = new FileLoader(this);
    }

    public static registerLoader(loader: IAssetLoader): void {
        this.instance._loaders.push(loader);
    }

    public static onAssetLoaded(asset: IAsset, eventType: EVENTS = EVENTS.ASSET_LOADED): void {
        AssetManager.instance._assets.set(AssetManager.sanitizePath(asset.name), asset);
        EventManager.post(eventType + AssetManager.sanitizePath(asset.name), this, asset);
    }

    /*
    public static loadMap(scene: Scene2D, path: string, levelScale: number = 0.5) {
        AssetManager.instance._mapLoader.loadMap(scene, path, levelScale);
    }
    */

    public static registerAsset(asset: IAsset): void {
        AssetManager.instance._assets.set(AssetManager.sanitizePath(asset.name), asset);
    }

    public static load(name: string): void {
        const ext = (<string>(AssetManager.sanitizePath(name).split('.').pop())).toLowerCase();
        for (let loader of AssetManager.instance._loaders) {
            if (loader.supportedExtensions.includes(ext)) {
                loader.loadAsset(AssetManager.sanitizePath(name), this.instance._database);
                return;
            }
        }
        try {
            const loader = this._instance._fileLoader;
            loader.loadAsset(AssetManager.sanitizePath(name), this.instance._database);
            console.log('asset loaded');
        }
        catch (err) {
            Logger.error(err);
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
    private _fileLoader!: FileLoader;
    private _assets: std.HashMap<string, IAsset> = new std.HashMap<string, IAsset>();
    private _mapLoader: MapLoader = new MapLoader();
    private _database: DataBase = new DataBase();

    private _assimp: Importer;

    private constructor() {
        this._assimp = new Importer();
    }

    private static get instance(): AssetManager {
        if (!AssetManager._instance) {
            throw new Error('AssetManager not instanciated');
        }
        return AssetManager._instance;
    }

}