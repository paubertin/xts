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

interface SystemInfoDisplayMode
{
    width: number;
    height: number;
    bitsPerPixel: number;
    refreshHz: number;
}

export interface SystemInfo
{
    architecture      : string;
    cpuDescription    : string;
    cpuVendor         : string;
    numPhysicalCores  : number;
    numLogicalCores   : number;
    ramInMegabytes    : number;
    frequencyInMegaHZ : number;

    osName            : string;
    osVersionMajor    : number;
    osVersionMinor    : number;
    osVersionBuild    : number;

    platformProfile   : string;

    displayModes      : SystemInfoDisplayMode[];
    userLocale        : string;

    native?           : boolean;
    plugin?           : boolean;
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

    private _systemInfo!: SystemInfo;

    private _version: string = '0.0.1';

    private _window!: Window;

    constructor(engineOptions: Partial<IEngineOptions> = {}) {
        this._options = { ...{ window: defaultWindowProperties }, ...engineOptions };
    }

    public get window(): Window {
        return this._window;
    }

    public get systemInfo() {
        return this._systemInfo;
    }

    public get version(): string {
        return this._version;
    }

    private _getSystemInfo(): void {
        let systemInfo : SystemInfo = {
            architecture: '',
            cpuDescription: '',
            cpuVendor: '',
            numPhysicalCores: (navigator.hardwareConcurrency || 1),
            numLogicalCores: (navigator.hardwareConcurrency || 1),
            ramInMegabytes: ((<any>navigator).deviceMemory || ''),
            frequencyInMegaHZ: 0,
            osVersionMajor: 0,
            osVersionMinor: 0,
            osVersionBuild: 0,
            osName: navigator.platform,
            platformProfile: "desktop",
            displayModes: [],
            userLocale: (navigator.language).replace('-', '_')
        };

        function looksLikeNetbook(): boolean
        {
            var minScreenDim = Math.min(window.screen.height, window.screen.width);
            return minScreenDim < 900;
        }

        const userAgent = navigator.userAgent;
        let osIndex = userAgent.indexOf('Windows');
        if (osIndex !== -1)
        {
            systemInfo.osName = 'Windows';
            if (navigator.platform === 'Win64')
            {
                systemInfo.architecture = 'x86_64';
            }
            else if (navigator.platform === 'Win32')
            {
                systemInfo.architecture = 'x86';
            }
            osIndex += 7;
            if (userAgent.slice(osIndex, (osIndex + 4)) === ' NT ')
            {
                osIndex += 4;
                systemInfo.osVersionMajor = parseInt(userAgent.slice(osIndex, (osIndex + 1)), 10);
                systemInfo.osVersionMinor = parseInt(userAgent.slice((osIndex + 2), (osIndex + 4)), 10);
            }
            if (looksLikeNetbook())
            {
                systemInfo.platformProfile = "tablet";
                Logger.debug("Setting platformProfile to 'tablet'");
            }
        }
        else
        {
            osIndex = userAgent.indexOf('Mac OS X');
            if (osIndex !== -1)
            {
                systemInfo.osName = 'Darwin';
                if (navigator.platform.indexOf('Intel') !== -1)
                {
                    systemInfo.architecture = 'x86';
                }
                osIndex += 9;
                systemInfo.osVersionMajor = parseInt(userAgent.slice(osIndex, (osIndex + 2)), 10);
                systemInfo.osVersionMinor = parseInt(userAgent.slice((osIndex + 3), (osIndex + 4)), 10);
                systemInfo.osVersionBuild = (parseInt(userAgent.slice((osIndex + 5), (osIndex + 6)), 10) || 0);
            }
            else
            {
                osIndex = userAgent.indexOf('Tizen');
                if (osIndex !== -1)
                {
                    systemInfo.osName = 'Tizen';
                    if (navigator.platform.indexOf('arm'))
                    {
                        systemInfo.architecture = 'arm';
                    }
                    if (-1 !== userAgent.indexOf('Mobile'))
                    {
                        systemInfo.platformProfile = "smartphone";
                    }
                    else
                    {
                        systemInfo.platformProfile = "tablet";
                    }
                }
                else
                {
                    osIndex = userAgent.indexOf('fireos');
                    if (osIndex !== -1)
                    {
                        systemInfo.osName = 'Fire OS';
                        if (navigator.platform.indexOf('arm'))
                        {
                            systemInfo.architecture = 'arm';
                        }

                        if (-1 !== userAgent.indexOf('Kindle Fire') ||
                            -1 !== userAgent.indexOf('KFOT') ||
                            -1 !== userAgent.indexOf('KFTT') ||
                            -1 !== userAgent.indexOf('KFJWI') ||
                            -1 !== userAgent.indexOf('KFJWA') ||
                            -1 !== userAgent.indexOf('KFSOWI') ||
                            -1 !== userAgent.indexOf('KFTHWI') ||
                            -1 !== userAgent.indexOf('KFTHWA') ||
                            -1 !== userAgent.indexOf('KFAPWI') ||
                            -1 !== userAgent.indexOf('KFAPWA'))
                        {
                            systemInfo.platformProfile = "tablet";
                        }
                        else if (-1 !== userAgent.indexOf('Fire Phone'))
                        {
                            // TODO: update when user agent device name is known
                            systemInfo.platformProfile = "smartphone";
                        }
                        else
                        {
                            // assume something else, most likely Fire TV
                        }
                    }
                    else
                    {
                        osIndex = userAgent.indexOf('Linux');
                        if (osIndex !== -1)
                        {
                            systemInfo.osName = 'Linux';
                            if (navigator.platform.indexOf('64') !== -1)
                            {
                                systemInfo.architecture = 'x86_64';
                            }
                            else if (navigator.platform.indexOf('x86') !== -1)
                            {
                                systemInfo.architecture = 'x86';
                            }
                            if (looksLikeNetbook())
                            {
                                systemInfo.platformProfile = "tablet";
                                Logger.debug("Setting platformProfile to 'tablet'");
                            }
                        }
                        else
                        {
                            osIndex = userAgent.indexOf('Android');
                            if (-1 !== osIndex)
                            {
                                systemInfo.osName = 'Android';
                                if (navigator.platform.indexOf('arm'))
                                {
                                    systemInfo.architecture = 'arm';
                                }
                                else if (navigator.platform.indexOf('x86'))
                                {
                                    systemInfo.architecture = 'x86';
                                }
                                if (-1 !== userAgent.indexOf('Mobile'))
                                {
                                    systemInfo.platformProfile = "smartphone";
                                }
                                else
                                {
                                    systemInfo.platformProfile = "tablet";
                                }
                            }
                            else
                            {
                                if (-1 !== userAgent.indexOf('CrOS'))
                                {
                                    systemInfo.osName = 'Chrome OS';
                                    if (navigator.platform.indexOf('arm'))
                                    {
                                        systemInfo.architecture = 'arm';
                                    }
                                    else if (navigator.platform.indexOf('x86'))
                                    {
                                        systemInfo.architecture = 'x86';
                                    }
                                    if (systemInfo.architecture === 'arm' ||
                                        looksLikeNetbook())
                                    {
                                        systemInfo.platformProfile = "tablet";
                                        Logger.debug("Setting platformProfile to 'tablet'");
                                    }
                                }
                                else if (-1 !== userAgent.indexOf("iPhone") ||
                                         -1 !== userAgent.indexOf("iPod"))
                                {
                                    systemInfo.osName = 'iOS';
                                    systemInfo.architecture = 'arm';
                                    systemInfo.platformProfile = 'smartphone';
                                }
                                else if (-1 !== userAgent.indexOf("iPad"))
                                {
                                    systemInfo.osName = 'iOS';
                                    systemInfo.architecture = 'arm';
                                    systemInfo.platformProfile = 'tablet';
                                }
                            }
                        }
                    }
                }
            }
        }

        this._systemInfo = systemInfo;
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

        this._getSystemInfo();
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