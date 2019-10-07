import { EventManager } from '../events/eventManager';
import { IEventHandler } from '../events/iEventHandler';
import { Event, EVENTS } from '../events/event';
import { AssetManager } from '../resources/assetManager'
import { ImageAsset } from '../resources/imageLoader';
import { Maths } from '../maths';
import { WebGLContext } from '../gl/webglContext';

export enum TextureTarget {
    NONE = 'NONE',
    Texture2D = '2D',
    Texture2DArray = '2DArray',
    TextureCube = 'Cube',
    Texture3D = '3D',
}

export interface TextureType {
    '2D': TextureTarget;
    'Cube': TextureTarget;
}

function TextureTargetToGL(gl: WebGL2RenderingContext, type: TextureTarget): GLenum {
    switch (type) {
        case TextureTarget.Texture2D: return gl.TEXTURE_2D;
        case TextureTarget.Texture2DArray: return gl.TEXTURE_2D_ARRAY;
        case TextureTarget.TextureCube: return gl.TEXTURE_CUBE_MAP;
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

function TextureFormatToGL(gl: WebGL2RenderingContext, format: TextureFormat): GLenum {
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

function TextureFilterToGL(gl: WebGL2RenderingContext, filter: TextureFilter): GLenum {
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

function TextureWrapToGL(gl: WebGL2RenderingContext, wrap: TextureWrap): GLenum {
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
        public type?: GLenum) {
    }
}

export type CubeFaceType = 'right' | 'left' | 'top' | 'bottom' | 'back' | 'front';

export interface CubeAsset {
    path: string;
    dataType: CubeFaceType;
    content: ImageAsset;
    loaded?: boolean;
}

export abstract class Texture implements IEventHandler {
    protected _isLoaded: boolean = false;
    protected _handle!: WebGLTexture;
    protected _target: TextureTarget = TextureTarget.NONE;

    protected constructor(protected _context: WebGLContext, protected _name: string,
        protected _width: number,
        protected _height: number,
        protected _parameters: TextureParameters) {
        if (this._parameters.type === undefined) this._parameters.type = _context.gl.UNSIGNED_BYTE;
        this._handle = <WebGLTexture>(this._context.gl.createTexture());
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
        this._context.gl.deleteTexture(this._handle);
    }

    public bind(slot: number = 0): void {
        const gl = this._context.gl;
        if (slot > 0) {
            gl.activeTexture(slot + gl.TEXTURE0);
        }
        gl.bindTexture(TextureTargetToGL(gl, this._target), this._handle);
    }

    public unbind(slot: number = 0): void {
        const gl = this._context.gl;
        if (slot > 0) {
            gl.activeTexture(slot + gl.TEXTURE0);
        }
        gl.bindTexture(TextureTargetToGL(gl, this._target), null);
    }

    protected abstract load(asset: ImageAsset | CubeAsset[]): void;

    protected isPowerOf2(): boolean {
        return Maths.isPowerOf2(this._width) && Maths.isPowerOf2(this.height);
    }
}

export class Texture1D extends Texture {
    constructor(context: WebGLContext, name: string, width: number, parameters: TextureParameters = new TextureParameters()) {
        super(context, name, width, 0, parameters);
        this._target = TextureTarget.Texture2D;
    }

    protected load(asset: ImageAsset): void {

    }
}

export class Texture2D extends Texture {
    constructor(context: WebGLContext, name: string, width: number = 100, height: number = 100, parameters: TextureParameters = new TextureParameters()) {
        super(context, name, width, height, parameters);
        this._target = TextureTarget.Texture2D;
        // this.bind();
        const pixels = new Uint8Array([0, 0, 255, 255]);
        const gl = context.gl;
        // const pixels = null;
        gl.texImage2D(TextureTargetToGL(gl, this._target), 0, TextureFormatToGL(gl, this._parameters.format), this._width, this._height,
            0, TextureFormatToGL(gl, this._parameters.format), this._parameters.type!, pixels);
        
        let asset = <ImageAsset>AssetManager.get(this._name);
        if (asset) {
            this.load(asset);
        } else {
            EventManager.subscribe(EVENTS.ASSET_LOADED + this.name, this);
        }
    }

    protected load(asset: ImageAsset): void {
        const gl = this._context.gl;
        this._width = asset.width;
        this._height = asset.height;

        const glTarget = TextureTargetToGL(gl, this._target);

        this.bind();
        // gl.texImage2D(this._target, 0, this._parameters.format, this._width,
        //     this._height, 0, this._parameters.format, this._parameters.type, asset.data);

        // flip Y
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        
        gl.texImage2D(glTarget, 0, TextureFormatToGL(gl, this._parameters.format),
            TextureFormatToGL(gl, this._parameters.format), this._parameters.type!, asset.data);

        if (this.isPowerOf2()) {
            gl.generateMipmap(glTarget);
        } else {
            gl.texParameteri(glTarget, gl.TEXTURE_WRAP_S, TextureWrapToGL(gl, this._parameters.wrap));
            gl.texParameteri(glTarget, gl.TEXTURE_WRAP_T, TextureWrapToGL(gl, this._parameters.wrap));
            gl.generateMipmap(glTarget);
        }
        gl.texParameteri(glTarget, gl.TEXTURE_MAG_FILTER,
            this._parameters.filter === TextureFilter.LINEAR ? TextureFilterToGL(gl, TextureFilter.LINEAR) : TextureFilterToGL(gl, TextureFilter.NEAREST));
        gl.texParameteri(glTarget, gl.TEXTURE_MIN_FILTER,
            this._parameters.filter === TextureFilter.LINEAR ? TextureFilterToGL(gl, TextureFilter.LINEAR_MIPMAP_LINEAR) : TextureFilterToGL(gl, TextureFilter.NEAREST));
        
        console.log('texture loaded');
        this._isLoaded = true;
    }
}

export class Texture3D extends Texture {
    constructor(context: WebGLContext, name: string, width: number, height: number, parameters: TextureParameters = new TextureParameters()) {
        super(context, name, width, height, parameters);
        this._target = TextureTarget.Texture3D;
    }

    protected load(asset: ImageAsset): void {
        
    }
}



export class TextureCube extends Texture {
    private _info: any;
    private _assets: CubeAsset[] = [];
    private _ext: string;
    constructor(context: WebGLContext, name: string, ext: string = 'jpg', width: number = 100,
        height: number = 100, parameters: TextureParameters = new TextureParameters()) {
        super(context, name, width, height, parameters);
        this._ext = ext;
        this._target = TextureTarget.TextureCube;

        this.bind();
        const gl = context.gl;
        const glTarget = TextureTargetToGL(gl, this._target);

        gl.texParameteri(glTarget, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(glTarget, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(glTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(glTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(glTarget, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        ['right', 'left', 'top', 'bottom', 'back', 'front'].forEach((faceType: string) => {
            const dataType = <CubeFaceType>faceType;
            let cubeAsset: CubeAsset = {
                path: this._makePath(dataType),
                dataType,
                content: <ImageAsset>AssetManager.get(this._makePath(dataType)),
            };
            cubeAsset.loaded = cubeAsset.content !== undefined;
            this._assets.push(cubeAsset);
        });
        if (this._assets.every((asset) => asset.loaded)) {
            this.load(this._assets);
        }
        else {
            this._assets.forEach((asset) => {
                EventManager.subscribe(EVENTS.ASSET_LOADED + asset.path, this);
            });
        }
    }

    private _makePath(face: CubeFaceType): string {
        return this._name + '/' + face + '.' + this._ext;
    }

    public onEvent(event: Event): void {
        let asset = this._assets.find((asset) => EVENTS.ASSET_LOADED + asset.path === event.code);
        if (asset) {
            asset.loaded = true;
            asset.content = <ImageAsset>event.context;
        }
        if (this._assets.every((asset) => asset.loaded)) {
            this.load(this._assets);
        }
    }

    protected load(cubeAssets: CubeAsset[]): void {
        const gl = this._context.gl;
        this._width = cubeAssets[0].content.width;
        this._height = cubeAssets[1].content.height;

        this.bind();
        for (let cubeAsset of cubeAssets) {
            let target: number;
            switch(cubeAsset.dataType) {
                case 'right': target = gl.TEXTURE_CUBE_MAP_POSITIVE_X; break;
                case 'left': target = gl.TEXTURE_CUBE_MAP_NEGATIVE_X; break;
                case 'top': target = gl.TEXTURE_CUBE_MAP_POSITIVE_Y; break;
                case 'bottom': target = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y; break;
                case 'front': target = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z; break;
                case 'back': target = gl.TEXTURE_CUBE_MAP_POSITIVE_Z; break;
            }
            gl.texImage2D(target!, 0, TextureFormatToGL(gl, this._parameters.format),
                this._width, this._height, 0,
                TextureFormatToGL(gl, this._parameters.format), this._parameters.type!,
                cubeAsset.content.data);
        }

        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        // gl.texImage2D(this._target, 0, this._parameters.format, this._width,
        //     this._height, 0, this._parameters.format, this._parameters.type, asset.data);

        // flip Y
        // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        // for (let i = 0; i < assets.length; ++i) {
        //     gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGB,
        //         gl.RGB, gl.UNSIGNED_BYTE, assets[i].data);
        // }


        /*
        if (this.isPowerOf2()) {
            gl.generateMipmap(glTarget);
        } else {
            gl.texParameteri(glTarget, gl.TEXTURE_WRAP_S, TextureWrapToGL(this._parameters.wrap));
            gl.texParameteri(glTarget, gl.TEXTURE_WRAP_T, TextureWrapToGL(this._parameters.wrap));
            gl.generateMipmap(glTarget);
        }
        */
        
        console.log('texture loaded');
        this._isLoaded = true;
    }
}