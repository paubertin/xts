export interface IAssetLoader {
    readonly supportedExtensions: string[];
    loadAsset(name: string): void;
}