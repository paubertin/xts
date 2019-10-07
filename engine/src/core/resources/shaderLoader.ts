import { ALoader } from "./iAssetLoader";
import { Logger } from "../utils/log";
import { IAsset } from "./iAsset";
import { IOfflineProvider } from "./offlineProvider";
import { EVENTS } from "../events/event";

export type ImageExtension = 'glsl';

export class ShaderAsset implements IAsset {

    public constructor(private _name: string, private _data: string) {}

    public get name(): string {
        return this._name;
    }

    public get data(): string {
        return this._data;
    }
}

export class ShaderLoader extends ALoader {
    public get supportedExtensions(): string[] {
        return ['glsl'];
    }

    public loadAsset(name: string, offlineProvider?: IOfflineProvider): void {
        const url = this._serverUrl + name;

        const noOfflineSupport = () => {
            throw new Error('Cannot load shader. No internet connection.');
        };

        const loadFromOfflineSupport = () => {
            if (offlineProvider) {
                offlineProvider.loadShader(url, name, this.onShaderSourceLoaded.bind(this));
            }
        };

        if (offlineProvider) {
            offlineProvider.open(loadFromOfflineSupport, noOfflineSupport);
        }
        else {
            noOfflineSupport();
        }
    }

    private onShaderSourceLoaded(name: string, source: string): void {
        Logger.info(`onShaderLoaded:`, name);
        const asset = new ShaderAsset(name, source);
        this._assetManager.onAssetLoaded(asset, EVENTS.SHADER_LOADED);
    }
}