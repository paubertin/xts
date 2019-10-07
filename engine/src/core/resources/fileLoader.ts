import { ALoader } from "./iAssetLoader";
import { IOfflineProvider } from "./offlineProvider";
import { IAssetManagerStatic } from "./assetManager";
import { Importer } from "./assimp/importer";
import { File } from "./file";

export class FileLoader extends ALoader {
    constructor(assetManager: IAssetManagerStatic) {
        super(assetManager);
        this.importer = new Importer();
    }
    public get supportedExtensions(): string [] {
        return [];
    }

    public loadAsset(name: string, offlineProvider?: IOfflineProvider): void {
        const url = this._serverUrl + name;

        const noOfflineSupport = () => {
            throw new Error('Cannot load file. No internet connection.');
        };

        const loadFromOfflineSupport = () => {
            if (offlineProvider) {
                offlineProvider.loadFile(url, this.onFileLoaded.bind(this));
            }
        };

        if (offlineProvider) {
            offlineProvider.open(loadFromOfflineSupport, noOfflineSupport);
        }
        else {
            noOfflineSupport();
        }
    }

    private onFileLoaded(file?: File) {
        console.log('file loaded !', file);
        if (file) {
            this.importer.readFile(file, 0);
        }
    }

    private importer: Importer;
}