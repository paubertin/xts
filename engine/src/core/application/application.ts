import { Engine } from "./engine";
import { TimeStep } from "../utils/timestep";
import { Color } from "../graphics/color";
import { AssetManager } from "../resources/assetManager";
import { ShaderManager } from "../gl/shaders/shaderManager";
import { default as basicShaderSource } from '../gl/shaders/basic_shader.glsl';
import { default as spriteShader } from '../gl/shaders/shader.glsl';
import { default as testShader } from '../gl/shaders/test_shader.glsl';
import { default as eboShader } from '../gl/shaders/ebo.glsl';
import { Mat, Vec3, Vec2 } from "../maths";
import { TextureManager } from "../graphics/textureManager";
import { WebGLContext } from "../gl/webglContext";

export interface IApplication {
    onUpdate(delta: TimeStep): void;
    onRender(): void;
    onTick(): void;
}

export interface IGame {
    onInit(): void;
    onUpdate(delta: TimeStep): void;
    onRender(): void;
    onTick(): void;

    setEngine(engine: Engine): void;
}

export abstract class AGame implements IGame {
    protected engine!: Engine;
    protected context!: WebGLContext;
    constructor() {}

    abstract onInit(): void;
    abstract onUpdate(delta: TimeStep): void;
    abstract onRender(): void;
    onTick(): void {}

    setEngine(engine: Engine): void {
        this.engine = engine;
        this.context = engine.window.context;
    }

}

export class Application implements IApplication {
    private _engine: Engine = new Engine();
    private static _app: Application;
    private game!: IGame;

    constructor() {
    }


    public static init(game?: IGame): void {
        if (Application._app) {
            throw new Error('Application already instantiated');
        }
        Application._app = new Application();
        if (game) {
            Application._app.game = game;
        }
        Application._app.onInit();
    }

    public static run(): void {
        if (!Application._app) {
            throw new Error('Application not instanciated. First call static init method.');
        }
        Application._app._engine.run();
    }

    private onInit(): void {
        let config = require('../../config.json');
        if (config.window.color) {
            config.window.color = new Color(...config.window.color);
        }
        this._engine = new Engine(config);
        this._engine.init(this);

        if (this.game) {
            this.game.setEngine(this._engine);
            this.game.onInit();
        }

        // this.scene = new Scene2D(this._engine);
        // ShaderManager.load(basicShaderSource, 'sprite');
        // ShaderManager.load(spriteShader, 'shader');
        // AssetManager.loadMap(this.scene, 'assets/levels/map.json');

        
    }

    public onUpdate(step: TimeStep): void {
        //this.scene.update(step);
        if (this.game) {
            this.game.onUpdate(step);
        }
    }

    public onRender(): void {
        //this.scene.render();
        
        if (this.game) {
            this.game.onRender();
        }
    }

    public onTick(): void {
        if (this.game) {
            this.game.onTick();
        }
    }
}