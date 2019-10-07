import { IAssetLoader, ALoader } from "./iAssetLoader";
import { Logger } from "../utils/log";
import { IAsset } from "./iAsset";
import { getExtension } from "../utils";
import { TargaProcessor } from "./targa";
import { IOfflineProvider } from "./offlineProvider";

export type ImageExtension = 'png' | 'jpg' | 'jpeg' | 'gif' | 'tga';

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

export class ImageLoader extends ALoader {
    public get supportedExtensions(): string[] {
        return ['png', 'jpg', 'jpeg', 'gif', 'tga'];
    }

    public loadAsset(name: string, offlineProvider?: IOfflineProvider): void {
        let extension = getExtension(name);
        switch (extension) {
            case 'tga': {
                let request = new XMLHttpRequest();
                request.responseType = 'arraybuffer';
                request.open('GET', name);
                request.addEventListener('load', this.onTargaLoaded.bind(this, name, request));
                request.send();
                break;
            }
            default: {
                const image: HTMLImageElement = new Image();
                image.crossOrigin = 'anonymous';

                const loadHandler = () => {
                    image.removeEventListener('load', loadHandler);
                    image.removeEventListener('error', errorHandler);

                    this.onImageLoaded(name, image);

                    if (image.src)
                        URL.revokeObjectURL(image.src);
                };

                const errorHandler = (err: any) => {
                    image.removeEventListener('load', loadHandler);
                    image.removeEventListener('error', errorHandler);

                    Logger.error(`Error trying to load image ${name}: ${err}`);

                    if (image.src)
                        URL.revokeObjectURL(image.src);
                };

                image.addEventListener('load', loadHandler);
                image.addEventListener('error', errorHandler);

                const url = this._serverUrl + name;

                const noOfflineSupport = () => {
                    image.src = url;
                };

                const loadFromOfflineSupport = () => {
                    if (offlineProvider) {
                        offlineProvider.loadImage(url, image);
                    }
                };

                if (offlineProvider) {
                    offlineProvider.open(loadFromOfflineSupport, noOfflineSupport);
                }
                else {
                    noOfflineSupport();
                }

                break;
            }
        }
    }

    private onTargaLoaded(name: string, request: XMLHttpRequest): void {
        Logger.info(`onTargaLoaded:`, name);
        if (request.readyState === request.DONE) {
            const imgDataUrl = TargaProcessor.loadToDataUrl(request.response);
            const image = new Image();
            image.onload = this.onImageLoaded.bind(this, name, image);
            image.src = imgDataUrl;
        }
    }

    private onImageLoaded(name: string, image: HTMLImageElement): void {
        Logger.info(`onImageLoaded:`, name);
        const asset = new ImageAsset(name, image);
        this._assetManager.onAssetLoaded(asset);
    }
}

export class CubeLoader implements IAssetLoader {
    public get supportedExtensions(): string[] {
        return ['cube'];
    }
    public loadAsset(name: string): void {
        
    }
}