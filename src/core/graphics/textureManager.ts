import { Texture2D } from "./texture";
import * as std from 'tstl';
import { Logger } from '../utils/log'

class TextureReference {
    public texture: Texture2D;
    public refCount: number = 1;

    public constructor(texture: Texture2D) {
        this.texture = texture;
    }
}

export class TextureManager {

    public static init(): void {
        if (TextureManager._instance) {
            throw new Error('TextureManager already instanciated');
        }
        TextureManager._instance = new TextureManager();
    }

    public static has(name: string): boolean {
        return this.instance._textures.has(name);
    }

    public static get(name: string): Texture2D {
        if (!TextureManager.has(name)) {
            const texture = new Texture2D(name);
            this._instance._textures.set(name, new TextureReference(texture));
        } else {
            this.instance._textures.get(name).refCount++;
        }
        return this.instance._textures.get(name).texture;
    }

    public static release(name: string | undefined): void {
        if (!name) return;
        if (!TextureManager.has(name)) {
            Logger.warn(`Texture ${name} does not exist.`)
        } else {
            this.instance._textures.get(name).refCount--;
            if (this.instance._textures.get(name).refCount < 1) {
                this.instance._textures.get(name).texture.destroy();
                this.instance._textures.erase(name);
            }
        }

    }

    /*
        Private
    */
    private static _instance: TextureManager;
    private _textures: std.HashMap<string, TextureReference> = new std.HashMap<string, TextureReference>();

    private constructor() {}

    private static get instance(): TextureManager {
        if (!TextureManager._instance) {
            throw new Error('TextureManager not instanciated');
        }
        return TextureManager._instance;
    }
}