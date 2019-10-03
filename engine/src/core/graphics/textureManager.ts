import { Texture2D, TextureCube, TextureTarget, TextureType, Texture } from "./texture";
import * as std from 'tstl';
import { Logger } from '../utils/log'
import { WebGLContext } from "../gl/webglContext";

class TextureReference {
    public texture: Texture;
    public refCount: number = 1;

    public constructor(texture: Texture) {
        this.texture = texture;
    }
}

class TextureCubeReference {
    public texture: TextureCube;
    public refCount: number = 1;

    public constructor(texture: TextureCube) {
        this.texture = texture;
    }
}

export class TextureManager {

    public static init(context: WebGLContext): void {
        if (TextureManager._instance) {
            throw new Error('TextureManager already instanciated');
        }
        TextureManager._instance = new TextureManager(context);
    }

    public static has(name: string): boolean {
        return this.instance._textures.has(name);
    }

    public static hasCube(name: string): boolean {
        return this.instance._texturesCube.has(name);
    }

    public static create<texType extends keyof TextureType>(name: string, type?: texType, ext?: string): Texture | undefined {
        switch(type) {
            default:
            case '2D': {
                if (!TextureManager.has(name)) {
                    const texture = new Texture2D(this._context, name);
                    this._instance._textures.set(name, new TextureReference(texture));
                } else {
                    Logger.warn('Texture 2D already exists...');
                    return;
                }
                return this.instance._textures.get(name).texture as Texture2D;
            }
            case 'Cube': {
                if (!TextureManager.has(name)) {
                    const texture = new TextureCube(this._context, name, ext);
                    this._instance._textures.set(name, new TextureReference(texture));
                } else {
                    Logger.warn('Texture Cube already exists...');
                    return;
                }
                return this.instance._textures.get(name).texture as TextureCube;
            }
        }
    }

    public static get(name: string): Texture2D {
        if (!TextureManager.has(name)) {
            const texture = new Texture2D(this._context, name);
            this._instance._textures.set(name, new TextureReference(texture));
        } else {
            this.instance._textures.get(name).refCount++;
        }
        return this.instance._textures.get(name).texture as Texture2D;
    }

    public static getCube(name: string, ext: string = 'jpg'): TextureCube {
        if (!TextureManager.hasCube(name)) {
            const texture = new TextureCube(this._context, name, ext);
            this._instance._texturesCube.set(name, new TextureCubeReference(texture));
        } else {
            this.instance._texturesCube.get(name).refCount++;
        }
        return this.instance._texturesCube.get(name).texture;
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
    private _texturesCube: std.HashMap<string, TextureCubeReference> = new std.HashMap<string, TextureCubeReference>();
    private _context: WebGLContext;

    private static get _context(): WebGLContext {
        return this._instance._context;
    }

    private constructor(context: WebGLContext) {
        this._context = context;
    }

    private static get instance(): TextureManager {
        if (!TextureManager._instance) {
            throw new Error('TextureManager not instanciated');
        }
        return TextureManager._instance;
    }
}