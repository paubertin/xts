import { gl } from '../gl';
import { EventManager } from '../events/eventManager';
import { IEventHandler } from '../events/iEventHandler';
import { Event, EVENTS } from '../events/event';
import { AssetManager } from '../resources/assetManager'
import { ImageAsset } from '../resources/imageLoader';
import { Maths } from '../maths';

export enum TextureTarget {
    NONE,
    Texture2D,
    Texture2DArray,
    TextureCUBE,
    Texture3D,
}

function TextureTargetToGL(type: TextureTarget): GLenum {
    switch (type) {
        case TextureTarget.Texture2D: return gl.TEXTURE_2D;
        case TextureTarget.Texture2DArray: return gl.TEXTURE_2D_ARRAY;
        case TextureTarget.TextureCUBE: return gl.TEXTURE_CUBE_MAP;
        case TextureTarget.Texture3D: return gl.TEXTURE_3D;
        default: return 0;
    }
}

export enum TextureFormat {
    NONE,
    RBG,
    RGBA,
    LUMINANCE,
    LUMINANCE_ALPHA,
}

function TextureFormatToGL(format: TextureFormat): GLenum {
    switch (format) {
        case TextureFormat.RBG: return gl.RGB;
        case TextureFormat.RGBA: return gl.RGBA;
        case TextureFormat.LUMINANCE: return gl.LUMINANCE;
        case TextureFormat.LUMINANCE_ALPHA: return gl.LUMINANCE_ALPHA;
        default: return 0;
    }
}

export enum TextureFilter {
    LINEAR,
    LINEAR_MIPMAP_LINEAR,
    NEAREST,
}

function TextureFilterToGL(filter: TextureFilter): GLenum {
    switch (filter) {
        case TextureFilter.LINEAR: return gl.LINEAR;
        case TextureFilter.LINEAR_MIPMAP_LINEAR: return gl.LINEAR_MIPMAP_LINEAR;
        case TextureFilter.NEAREST: return gl.NEAREST;
        default: return 0;
    }
}

export enum TextureWrap {
    REPEAT,
    CLAMP_TO_EDGE,
    MIRRORED_REPEAT,
}

function TextureWrapToGL(wrap: TextureWrap): GLenum {
    switch (wrap) {
        case TextureWrap.REPEAT: return gl.REPEAT;
        case TextureWrap.CLAMP_TO_EDGE: return gl.CLAMP_TO_EDGE;
        case TextureWrap.MIRRORED_REPEAT: return gl.MIRRORED_REPEAT;
        default: return 0;
    }
}

class TextureParameters {
    public constructor(
        public format: TextureFormat = TextureFormat.RGBA,
        public filter: TextureFilter = TextureFilter.LINEAR,
        public wrap: TextureWrap = TextureWrap.REPEAT,
        public type: GLenum = gl.UNSIGNED_BYTE) {
    }
}

export abstract class Texture implements IEventHandler {
    protected _isLoaded: boolean = false;
    protected _handle!: WebGLTexture;
    protected _target: TextureTarget = TextureTarget.NONE;

    protected constructor(protected _name: string,
        protected _width: number,
        protected _height: number,
        protected _parameters: TextureParameters) {
        
        this._handle = <WebGLTexture>(gl.createTexture());
    }

    public onEvent(event: Event): void {
        if (event.code === EVENTS.ASSET_LOADED + this._name) {
            this.load(<ImageAsset>event.context);
        }
    }

    public get isLoaded (): boolean {
        return this._isLoaded;
    }

    public get name(): string {
        return this._name;
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public destroy(): void {
        gl.deleteTexture(this._handle);
    }

    public bind(slot: number = 0): void {
        if (slot > 0) {
            gl.activeTexture(slot + gl.TEXTURE0);
        }
        gl.bindTexture(TextureTargetToGL(this._target), this._handle);
    }

    public unbind(slot: number = 0): void {
        if (slot > 0) {
            gl.activeTexture(slot + gl.TEXTURE0);
        }
        gl.bindTexture(TextureTargetToGL(this._target), null);
    }

    protected abstract load(asset: ImageAsset): void;

    protected isPowerOf2(): boolean {
        return Maths.isPowerOf2(this._width) && Maths.isPowerOf2(this.height);
    }
}

export class Texture1D extends Texture {
    constructor(name: string, width: number, parameters: TextureParameters = new TextureParameters()) {
        super(name, width, 0, parameters);
        this._target = TextureTarget.Texture2D;
    }

    protected load(asset: ImageAsset): void {

    }
}

export class Texture2D extends Texture {
    constructor(name: string, width: number = 100, height: number = 100, parameters: TextureParameters = new TextureParameters()) {
        super(name, width, height, parameters);
        this._target = TextureTarget.Texture2D;
        // this.bind();
        const pixels = new Uint8Array([0, 0, 255, 255]);
        // const pixels = null;
        gl.texImage2D(TextureTargetToGL(this._target), 0, TextureFormatToGL(this._parameters.format), this._width, this._height,
            0, TextureFormatToGL(this._parameters.format), this._parameters.type, pixels);
        
        let asset = <ImageAsset>AssetManager.get(this._name);
        if (asset) {
            this.load(asset);
        } else {
            EventManager.subscribe(EVENTS.ASSET_LOADED + this.name, this);
        }
    }

    protected load(asset: ImageAsset): void {
        this._width = asset.width;
        this._height = asset.height;

        const glTarget = TextureTargetToGL(this._target);

        this.bind();
        // gl.texImage2D(this._target, 0, this._parameters.format, this._width,
        //     this._height, 0, this._parameters.format, this._parameters.type, asset.data);

        // flip Y
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(glTarget, 0, TextureFormatToGL(this._parameters.format),
            TextureFormatToGL(this._parameters.format), this._parameters.type, asset.data);

        if (this.isPowerOf2()) {
            gl.generateMipmap(glTarget);
        } else {
            gl.texParameteri(glTarget, gl.TEXTURE_WRAP_S, TextureWrapToGL(this._parameters.wrap));
            gl.texParameteri(glTarget, gl.TEXTURE_WRAP_T, TextureWrapToGL(this._parameters.wrap));
            gl.generateMipmap(glTarget);
        }
        gl.texParameteri(glTarget, gl.TEXTURE_MAG_FILTER,
            this._parameters.filter === TextureFilter.LINEAR ? TextureFilterToGL(TextureFilter.LINEAR) : TextureFilterToGL(TextureFilter.NEAREST));
        gl.texParameteri(glTarget, gl.TEXTURE_MIN_FILTER,
            this._parameters.filter === TextureFilter.LINEAR ? TextureFilterToGL(TextureFilter.LINEAR_MIPMAP_LINEAR) : TextureFilterToGL(TextureFilter.NEAREST));
    
        
        console.log('texture loaded');
        this._isLoaded = true;
    }
}

export class Texture3D extends Texture {
    constructor(name: string, width: number, height: number, parameters: TextureParameters = new TextureParameters()) {
        super(name, width, height, parameters);
        this._target = TextureTarget.Texture3D;
    }

    protected load(asset: ImageAsset): void {
        
    }
}