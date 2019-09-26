import { Shader } from './shader';

export interface IShaderManager {

}

export class ShaderManager implements IShaderManager {

    public static init(): void {
        if (ShaderManager._instance) {
            throw new Error('ShaderManager already instanciated');
        }
        ShaderManager._instance = new ShaderManager();
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

    public static load(shaderSource: string, name: string): Shader {
        return this.instance.load(shaderSource, name);
    }

    /*
        Private
    */

    private static _instance: ShaderManager;
    private shaders: Map<string, Shader> = new Map<string, Shader>();

    private constructor() {

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

    private load(shaderSource: string, name: string): Shader {
        const shader: Shader = new Shader(name, shaderSource);
        this.add(shader, name);
        return shader;
    }

}