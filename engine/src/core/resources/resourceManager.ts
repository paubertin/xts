export interface LoaderPlugin {
    readonly name: string;
    readonly extensions: string[];
    load(): void;
}

export class ResourceManager {

}