import { IApplication } from "./application";
import { Timer } from "../utils/timer";
import { TimeStep } from "../utils/timestep";
import { Debugger } from "../utils/debug";
import { Logger } from "../utils/log";
import { InputEvent, MouseClickEvent, KeyDownEvent } from '../events/inputEvent';
import { Window, IWindowProperties, defaultWindowProperties, IWindow } from "./window";
import { PerformanceMonitor } from "../utils/performance";
import { double, float, bool } from "../utils/types";
import { AssetManager } from "../resources/assetManager";
import { EventManager } from "../events/eventManager";
import { ShaderManager } from "../gl/shaders/shaderManager";
import { TextureManager } from "../graphics/textureManager";
import { InputManager } from "../input/inputManager";
import { Key } from "../input/keyboard";
import { IViewPortOwnerLike } from "../graphics/viewport";
import { WebGLContext } from "../gl/webglContext";


interface LoopParameters {
    timer: double;
    updateTimer: double;
    updateTick: double;
    updateStep: TimeStep;
    step: TimeStep;
}

interface IEngineOptions {
    window: Partial<IWindowProperties>;
}

export interface IEngine {
    readonly timer: Timer;
    readonly window: IWindow;
    readonly context: WebGLContext;
    getAspectRatio(viewPortOwner: IViewPortOwnerLike, useScreen?: boolean): float;
    getRenderWidth(useScreen?: boolean): float;
    getRenderHeight(useScreen?: boolean): float;
}

export class Engine implements IEngine {
    private _context!: WebGLContext;
    private _options: IEngineOptions;
    private _app!: IApplication;
    private _debugger: Debugger = new Debugger();
    private _monitor: PerformanceMonitor = new PerformanceMonitor();
    public timer: Timer = new Timer(false);
    private _loopParams!: LoopParameters;

    private _window!: Window;

    constructor(engineOptions: Partial<IEngineOptions> = {}) {
        this._options = { ...{ window: defaultWindowProperties }, ...engineOptions };
    }

    public get window(): Window {
        return this._window;
    }

    public get context(): WebGLContext {
        return this._context;
    }

    public getAspectRatio(viewPortOwner: IViewPortOwnerLike, useScreen: boolean = false): float {
        const viewport = viewPortOwner.viewport;
        return (this.getRenderWidth(useScreen) * viewport.width) / (this.getRenderHeight(useScreen) * viewport.height);
    }

    public getRenderWidth(useScreen: boolean = false): float {
        // currentRenderTarget ?
        return this._window.context.gl.drawingBufferWidth;
    }

    public getRenderHeight(useScreen: boolean = false): float {
        // currentRenderTarget ?
        return this._window.context.gl.drawingBufferHeight;
    }

    public run(): void {
        this.timer.start();
        this._loopParams = {
            timer: 0.0,
            updateTimer: this.timer.timeMs(),
            updateTick: 1000.0 / 60.0,
            updateStep: new TimeStep(this.timer.timeMs()),
            step: new TimeStep(this.timer.timeMs()),
        };
        this._loop();
    }

    public init(app: IApplication): void {
        this._app = app;

        this._window = new Window(this, 'xts', this._options.window);
        this._window.setEventsCallback(this._onEvent.bind(this));
        
        this._context = this._window.context;

        AssetManager.init();
        EventManager.init();
        ShaderManager.init(this._context);
        TextureManager.init(this._context);
    }

    private _loop(): void {
        const now = this.timer.timeMs();

        this._beginFrame(now);

        this._loopParams.step.update(now);

        this._debugger.stats.currFrame.id = this._debugger.stats.prevFrame.id + 1;
        this._debugger.stats.currFrame.delta = this._loopParams.step.millis;
        this._debugger.stats.currFrame.fps = 1.0 / (this._loopParams.step.millis / 1000);

        // update
        if (now - this._loopParams.updateTimer > this._loopParams.updateTick) {
            this._loopParams.updateStep.update(now);
            this.timer.tick();
            this._preUpdate(this._loopParams.updateStep);
            this._onUpdate(this._loopParams.updateStep);
            this._postUpdate(this._loopParams.updateStep);
            this._debugger.stats.currFrame.duration.update = this.timer.elapsedMs();
            this._loopParams.updateTimer += this._loopParams.updateTick;
        }

        // render
        this.timer.tick();
        this._preRender();
        this._onRender();
        this._postRender();
        this._debugger.stats.currFrame.duration.render = this.timer.elapsedMs();

        // tick every 1s
        if (this.timer.time() - this._loopParams.timer > 5.0) {
            this._loopParams.timer += 5.0;
            this._onTick();
        }

        this._endFrame();

        requestAnimationFrame(this._loop.bind(this));
    }

    private _beginFrame(timeMs: double): void {
        this._debugger.stats.prevFrame.reset(this._debugger.stats.currFrame);
        this._debugger.stats.currFrame.reset();

        this._monitor.sampleFrame(timeMs);

    }

    private _endFrame(): void {

    }

    private _preUpdate(step: TimeStep): void {
        EventManager.update(step);
        this._window.update(step);
    }

    private _onUpdate(step: TimeStep): void {
        this._app.onUpdate(step);
    }

    private _postUpdate(step: TimeStep): void {

    }

    private _preRender(): void {
        this._window.clear();
    }

    private _onRender(): void {
        this._app.onRender();
    }

    private _postRender(): void { }

    private _onTick(): void {
        this._app.onTick();
        // Logger.info('tick');
        // Logger.info(this._debugger.stats.currFrame);
        // document.title = 'FPS : ' + this._debugger.stats.currFrame.fps;
        // Logger.info('-----------------------------');
        // Logger.info('debugger FPS', this._debugger.stats.currFrame.fps);
        // Logger.info('FPS', this._monitor.FPS);
        // Logger.info('average FPS', this._monitor.averageFPS);
    }

    private _onEvent(event: InputEvent): void {
        // console.log('on event from engine', event);
        if (event instanceof MouseClickEvent) {
            Logger.info('Mouse click: ', event.x, event.y);
        }
    }
}