import { IOfflineProvider } from "./offlineProvider";

export interface IAssetLoader {
    readonly supportedExtensions: string[];
    loadAsset(name: string, offlineProvider?: IOfflineProvider): void;
}