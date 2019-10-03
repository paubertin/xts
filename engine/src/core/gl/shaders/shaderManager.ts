import { Shader } from './shader';
import { WebGLContext } from '../webglContext';

import { default as gridShader } from '../../gl/shaders/grid.glsl';
import { ShaderAsset } from 'src/core/resources/shaderLoader';
import { AssetManager } from 'src/core/resources/assetManager';

export interface IShaderManager {

}

export class ShaderManager implements IShaderManager {

    public static init(context: WebGLContext): void {
        if (ShaderManager._instance) {
            throw new Error('ShaderManager already instanciated');
        }
        ShaderManager._instance = new ShaderManager(context);

        AssetManager.registerAsset(new ShaderAsset('internal/gridshader', gridShader));
    }

    public static has(name: string): boolean {
        return this.instance.has(name);
    }

    public static get(name: string): Shader {
        return this.instance.get(name);
    }

    public static add(shader: Shader, name?: string): void {
        return this.instance.add(shader, name);
    }

    public static load(shaderSource: string): Shader {
        return this.instance.load(shaderSource);
    }

    /*
        Private
    */

    private static get _context(): WebGLContext {
        return ShaderManager._instance._context;
    }

    private static _instance: ShaderManager;
    private shaders: Map<string, Shader> = new Map<string, Shader>();
    private _context: WebGLContext;

    private constructor(context: WebGLContext) {
        this._context = context;
    }

    private static get instance(): ShaderManager {
        if (!ShaderManager._instance) {
            throw new Error('ShaderManager not instanciated');
        }
        return ShaderManager._instance;
    }

    private has(name: string): boolean {
        return !!this.shaders.get(name);
    }

    private get(name: string): Shader {
        const shader = this.shaders.get(name);
        if (!shader) {
            throw new Error(`Shader '${name}' not found.`)
        }
        return shader;
    }

    private add(shader: Shader, name?: string): void {
        name = name || shader.name;
        if (this.shaders.get(name)) {
            throw new Error(`Shader '${name}' already exists.`);
        }
        this.shaders.set(name, shader);
    }

    private load(shaderUrl: string): Shader {
        const shader: Shader = new Shader(this._context, shaderUrl);
        this.add(shader, shaderUrl);
        return shader;
    }

}