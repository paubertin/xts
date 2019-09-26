import { Color } from './color';
import { Shader } from '../gl/shaders/shader';
import { Texture2D } from './texture';
import { TextureManager } from './textureManager';
import { AssetManager } from '../resources/assetManager';

export class Material {
    private _shader!: Shader;
    private _diffuseTextureName!: string | undefined;
    private _diffuse!: Texture2D;
    private _color: Color;

    constructor(private _name: string, diffuseTextureName?: string, _color?: Color) {
        if (diffuseTextureName) {
            this._diffuseTextureName = AssetManager.sanitizePath(diffuseTextureName);
            this._diffuse = TextureManager.get(this._diffuseTextureName);
        }
        this._color = new Color(_color);
    }

    public get name(): string {
        return this._name;
    }

    public get shader(): Shader {
        return this._shader;
    }

    public set shader(shader: Shader) {
        this._shader = shader;
    }

    public get color(): Color {
        return this._color;
    }

    public get texture(): Texture2D {
        return this._diffuse;
    }

    public get diffuseTextureName(): string | undefined {
        return this._diffuseTextureName;
    }

    public set diffuseTextureName(value: string | undefined) {
        if (this._diffuse) {
            TextureManager.release(this._diffuseTextureName);
        }
        if (value) {
            this._diffuseTextureName = AssetManager.sanitizePath(value);
            this._diffuse = TextureManager.get(this._diffuseTextureName);
        }
    }

    public initialize(): void {
        this._shader.bind().setUniform1i('t_diffuse', 0);
    }

    public destroy (): void {
        TextureManager.release(this.diffuseTextureName);
        delete this._diffuse;
    }

    public preRender(): void {
        if (this._diffuse && this._diffuse.isLoaded) {
            this._color = Color.WHITE;
            this._shader.bind().setUniform4f('u_color', this._color.toArray());
            this._diffuse.bind(0);
        }
    }

}