import { gl } from '../../gl';
import * as std from 'tstl';
import { Mat } from '../../maths/linearAlgebra/matrix';

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

export class Shader {
    private _name!: string;
    private _program!: WebGLProgram;
    private _attributes: std.HashMap<string, VertexAttribute> = new std.HashMap<string, VertexAttribute>();
    private _uniforms: std.HashMap<string, Uniform> = new std.HashMap<string, Uniform>();

    constructor(name: string, shaderSource: string) {
        this._name = name;
        const shaderSources = this.preProcess(shaderSource);
        this.compile(shaderSources);
        this.detectAttributes();
        this.detectUniforms();
    }

    public get name(): string {
        return this._name;
    }

    public bind (): Shader {
        gl.useProgram(this._program);
        return this;
    }

    public unbind (): Shader {
        gl.useProgram(null);
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
        gl.uniform1i(location, integer);
    }

    public setUniform1f(name: string, float: number): void {
        const location = this.getUniformLocation(name);
        gl.uniform1f(location, float);
    }

    public setUniform1u(name: string, unsigned: number): void {
        const location = this.getUniformLocation(name);
        gl.uniform1ui(location, unsigned);
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
            gl.uniform4f(location, r, g, b, a);
        }
        else {
            if (r[3] === undefined) {
                r[3] = 1.0;
            }
            gl.uniform4fv(location, [r[0], r[1], r[2], r[3]]);
        }
    }

    public setUniformMatrix4fv(name: string, mat: Mat): void {
        const location = this.getUniformLocation(name);
        gl.uniformMatrix4fv(location, false, mat.data);
    }

    private detectAttributes(): void {
        const attrCount = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);
        for (let i=0; i < attrCount; ++i) {
            const info = gl.getActiveAttrib(this._program, i);
            if (!info) {
                break;
            }
            const attribute: VertexAttribute =  {
                name: info.name,
                size: info.size,
                location: gl.getAttribLocation(this._program, info.name),
                type: info.type,
            };
            this._attributes.set(info.name, attribute);
        }
    }

    private detectUniforms(): void {
        const uniformCount = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
        for (let i=0; i < uniformCount; ++i) {
            const info = gl.getActiveUniform(this._program, i);
            if (!info) {
                break;
            }
            const uniform: Uniform =  {
                name: info.name,
                size: info.size,
                location: gl.getUniformLocation(this._program, info.name),
                type: info.type,
            };
            this._uniforms.set(info.name, uniform);
        }
    }

    private compile (shaderSources: Map<number, string>): void {
        let program = gl.createProgram();
        if (!program) {
            throw new Error(`Error creating program '${this._name}'`);
        }
        this._program = program;

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
            gl.attachShader(this._program, shader);
            shaders.push(shader);
        }
        gl.linkProgram(this._program);
        const error = gl.getProgramInfoLog(this._program);
        if (error) {
            gl.deleteProgram(this._program);
            shaders.forEach((shader) => gl.deleteShader(shader));
            throw new Error(`Error linking shader program '${this._name}': ${error}`);
        }
        shaders.forEach((shader) => gl.detachShader(this._program, shader));
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
        switch(type) {
            case 'vertex': return gl.VERTEX_SHADER;
            case 'fragment': return gl.FRAGMENT_SHADER;
            default: throw new Error(`Unknown shader type: '${type}'`);
        }
    }
}