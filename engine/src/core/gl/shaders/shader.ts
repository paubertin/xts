import * as std from 'tstl';
import { Mat } from '../../maths/linearAlgebra/matrix';
import { WebGLContext } from '../webglContext';
import { WebGLObject } from '../glObject';
import { IEventHandler } from 'src/core/events/iEventHandler';
import { Event, EVENTS } from 'src/core/events/event';
import { ShaderAsset } from 'src/core/resources/shaderLoader';
import { AssetManager } from 'src/core/resources/assetManager';
import { EventManager } from 'src/core/events/eventManager';

interface ShaderInfo {
    type: number;
    name: string;
    size: number;
}

export interface VertexAttribute extends ShaderInfo {
    location: number;
    offset?: number;
}

export interface Uniform extends ShaderInfo {
    location: WebGLUniformLocation | null;
}

export class Shader extends WebGLObject<WebGLProgram> implements IEventHandler {
    protected _isLoaded: boolean = false;
    private _attributes: std.HashMap<string, VertexAttribute> = new std.HashMap<string, VertexAttribute>();
    private _uniforms: std.HashMap<string, Uniform> = new std.HashMap<string, Uniform>();

    constructor(context: WebGLContext, shaderUrl: string) {
        super(context, shaderUrl);
        let asset = <ShaderAsset>AssetManager.get(shaderUrl);
        if (asset) {
            this.initialize(asset);
        } else {
            EventManager.subscribe(EVENTS.SHADER_LOADED + this.name, this);
        }
    }

    public get loaded(): boolean {
        return this._isLoaded;
    }

    protected _delete(): void {
        this.context.gl.deleteProgram(this._handle);
        this._handle = null;
    }

    protected _initialize(shaderAsset: ShaderAsset): boolean {
        const shaderSources = this.preProcess(shaderAsset.data);
        let valid = this.compile(shaderSources);
        valid = valid && this.detectAttributes();
        valid = valid && this.detectUniforms();
        this._isLoaded = true;
        return valid;
    }

    public onEvent(event: Event): void {
        if (event.code ===  EVENTS.SHADER_LOADED + this._name) {
            this.initialize(<ShaderAsset>event.context);
        }
    }

    public bind (): Shader {
        this._context.gl.useProgram(this._handle);
        return this;
    }

    public unbind (): Shader {
        this._context.gl.useProgram(null);
        return this;
    }

    public getAttributeLocation(name: string): number {
        if (!this._attributes.has(name)) {
            throw new Error(`Unable to find attribute '${name}' in shader '${this.name}'`);
        }
        const elt = this._attributes.find(name);
        return elt.second.location;
    }

    public getUniformLocation(name: string): WebGLUniformLocation | null {
        if (!this._uniforms.has(name)) {
            throw new Error(`Unable to find uniform '${name}' in shader '${this.name}'`);
        }
        const elt = this._uniforms.find(name);
        return elt.second.location;
    }

    public setUniform1i(name: string, integer: number): void {
        const location = this.getUniformLocation(name);
        this._context.gl.uniform1i(location, integer);
    }

    public setUniform1f(name: string, float: number): void {
        const location = this.getUniformLocation(name);
        this._context.gl.uniform1f(location, float);
    }

    public setUniform1u(name: string, unsigned: number): void {
        const location = this.getUniformLocation(name);
        this._context.gl.uniform1ui(location, unsigned);
    }

    public setUniform4f(name: string, r: [number, number, number, number?]): void;
    public setUniform4f(name: string, r: number, g: number, b: number): void;
    public setUniform4f(name: string, r: number, g: number, b: number, a: number): void;
    public setUniform4f(name: string, r: [number, number, number, number?] | number, g?: number, b?: number, a?: number): void {
        const location = this.getUniformLocation(name);
        if (typeof r === 'number') {
            if (typeof g === 'undefined' || typeof b === 'undefined') {
                throw new Error(`Incorrect parameters while setting uniform4f, got (${r}, ${g}, ${b}, ${a})`);
            }
            if (typeof a === 'undefined') {
                a = 1.0;
            }
            this._context.gl.uniform4f(location, r, g, b, a);
        }
        else {
            if (r[3] === undefined) {
                r[3] = 1.0;
            }
            this._context.gl.uniform4fv(location, [r[0], r[1], r[2], r[3]]);
        }
    }

    public setUniformMatrix4fv(name: string, mat: Mat): void {
        const location = this.getUniformLocation(name);
        this._context.gl.uniformMatrix4fv(location, false, mat.data);
    }

    private detectAttributes(): boolean {
        if (!this._handle) return false;
        const gl = this._context.gl;
        const attrCount = gl.getProgramParameter(this._handle, gl.ACTIVE_ATTRIBUTES);
        for (let i=0; i < attrCount; ++i) {
            const info = gl.getActiveAttrib(this._handle, i);
            if (!info) {
                break;
            }
            const attribute: VertexAttribute =  {
                name: info.name,
                size: info.size,
                location: gl.getAttribLocation(this._handle, info.name),
                type: info.type,
            };
            this._attributes.set(info.name, attribute);
        }
        return true;
    }

    private detectUniforms(): boolean {
        if (!this._handle) return false;
        const gl = this._context.gl;
        const uniformCount = gl.getProgramParameter(this._handle, gl.ACTIVE_UNIFORMS);
        for (let i=0; i < uniformCount; ++i) {
            const info = gl.getActiveUniform(this._handle, i);
            if (!info) {
                break;
            }
            const uniform: Uniform =  {
                name: info.name,
                size: info.size,
                location: gl.getUniformLocation(this._handle, info.name),
                type: info.type,
            };
            this._uniforms.set(info.name, uniform);
        }
        return true;
    }

    private compile (shaderSources: Map<number, string>): boolean {
        const gl = this._context.gl;
        let program = gl.createProgram();
        if (!program) {
            throw new Error(`Error creating program '${this._name}'`);
        }
        this._handle = program;

        const shaders: WebGLShader[] = [];
        for (let entry of shaderSources.entries()) {
            const type: number = entry[0];
            const source: string = entry[1];
            const shader = gl.createShader(type);
            if (!shader) {
                throw new Error(`Error creating shader '${this._name}'`);
            }
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            const error = gl.getShaderInfoLog(shader);
            if (error) {
                gl.deleteShader(shader);
                throw new Error(`Error compiling shader '${this._name}': ${error}`);
            }
            gl.attachShader(this._handle, shader);
            shaders.push(shader);
        }
        gl.linkProgram(this._handle);
        const error = gl.getProgramInfoLog(this._handle);
        if (error) {
            gl.deleteProgram(this._handle);
            shaders.forEach((shader) => gl.deleteShader(shader));
            throw new Error(`Error linking shader program '${this._name}': ${error}`);
        }
        shaders.forEach((shader) => gl.detachShader(this._handle!, shader));
        return true;
    }

    private preProcess(source: string): Map<number, string> {
        const typeToken = '#type';
        let sources = new Map<number, string>();
        const vec: string[] = source.split(typeToken);
        for (let i = 1; i < vec.length; ++i) {
            const eol: number = vec[i].indexOf('\n');
            const type: string = vec[i].substring(1, eol).trim();
            const shaderSource: string = vec[i].substring(eol + 1);
            sources.set(this.shaderTypeFromString(type), shaderSource);
        }
        return sources;
    }

    private shaderTypeFromString(type: string): number {
        const gl = this._context.gl;
        switch(type) {
            case 'vertex': return gl.VERTEX_SHADER;
            case 'fragment': return gl.FRAGMENT_SHADER;
            default: throw new Error(`Unknown shader type: '${type}'`);
        }
    }
}