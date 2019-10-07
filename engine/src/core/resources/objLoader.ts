import { ALoader } from "./iAssetLoader";
import { IOfflineProvider } from "./offlineProvider";

export class ObjFileLoader extends ALoader {
    public get supportedExtensions(): string[] {
        return ['obj', 'mtl'];
    }

    public loadAsset(name: string, offlineProvider?: IOfflineProvider): void {

    }

    private onFileLoaded(name: string, source: string): void {
        
    }
}