import { IAssetLoader } from "./iAssetLoader";
import { Logger } from "../utils/log";
import { AssetManager } from './assetManager';
import { IAsset } from "./iAsset";

export class ImageAsset implements IAsset {

    public constructor(private _name: string, private _data: HTMLImageElement) {}

    public get name(): string {
        return this._name;
    }

    public get data(): HTMLImageElement {
        return this._data;
    }

    public get width(): number {
        return this._data.width;
    }

    public get height(): number {
        return this._data.height;
    }
}

export class ImageLoader implements IAssetLoader {
    public get supportedExtensions(): string[] {
        return ['png', 'jpg', 'jpeg', 'gif'];
    }

    public loadAsset(name: string): void {
        const image: HTMLImageElement = new Image();
        image.onload = this.onImageLoaded.bind(this, name, image);
        image.src = name;
    }

    private onImageLoaded(name: string, image: HTMLImageElement): void {
        Logger.info(`onImageLoaded:`, name);
        const asset = new ImageAsset(name, image);
        AssetManager.onAssetLoaded(asset);
    }
}