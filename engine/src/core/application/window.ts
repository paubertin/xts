import { Logger, warn } from '../utils/log';
import { Renderer, RendererBufferType } from '../graphics/renderer';
import { InputManager } from '../input/inputManager';
import { InputEvent } from '../events/inputEvent';
import { Color } from '../graphics/color';
import { Nullable } from '../utils/types';
import { IEngine } from './engine';
import { TimeStep } from '../utils/timestep';
import { Observable } from '../utils/observable';
import { KeyBoardInfo, KeyBoardEventType } from '../events/keyboardEvent';
import { ObservableInputManager } from '../input/observableInputManager';
import { PointerInfo } from '../events/pointerEvent';
import { Canvas } from './canvas';
import { WebGLContext } from '../gl/webglContext';
/*
    Interfaces
*/

export interface IWindowProperties {
    element?: string;
    title?: string;
    width: number;
    height: number;
    fullscreen: boolean;
    vsync: boolean;
    color: Color;
}

export interface IWindow {
    readonly width: number;
    readonly height: number;
    readonly vsync: boolean;
    readonly canvas: HTMLCanvasElement;
    readonly engine: IEngine;
    readonly keyBoardObservable: Observable<KeyBoardInfo>;
    readonly pointerObservable: Observable<PointerInfo>;

    addEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: any, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: any, ev: WindowEventMap[K]) => any, options?: boolean | EventListenerOptions): void;

    clear(): void;
    update(step: TimeStep): void;
}

export const defaultWindowProperties: IWindowProperties = {
    width: 1280,
    height: 720,
    color: new Color(),
    fullscreen: false,
    vsync: false,
};

export class Window implements IWindow {
    private _properties: IWindowProperties;
    private _canvasElement!: HTMLCanvasElement;
    private _canvas!: Canvas;
    private _engine: IEngine;
    private _title: string;
    private _eventCallback: Nullable<(event: InputEvent) => void> = null;

    private _isFullscreen: boolean = false;

    private _keyBoardObservable: Observable<KeyBoardInfo> = new Observable<KeyBoardInfo>();
    private _pointerObservable: Observable<PointerInfo> = new Observable<PointerInfo>();

    private _inputManager: ObservableInputManager = new ObservableInputManager(this);

    constructor (engine: IEngine, title: string = 'window', properties: Partial<IWindowProperties> = {}) {
        this._engine = engine;
        this._properties = { ...defaultWindowProperties, ...properties };
        this._title = title;
        if (this._properties.element !== undefined) {
            this._canvasElement = <HTMLCanvasElement>document.getElementById(this._properties.element);
            if (!this._canvasElement) {
                throw new Error(`Cannot find a canvas element named: ${this._properties.element}`);
            }
            if (this._properties.width && !this._properties.fullscreen) {
                this._canvasElement.width = this._properties.width;
            }
            else {
                this._canvasElement.width = window.innerWidth;
            }
            if (this._properties.height && !this._properties.fullscreen) {
                this._canvasElement.height = this._properties.height;
            }
            else {
                this._canvasElement.height = window.innerHeight;
            }
        }
        else {
            this._canvasElement = <HTMLCanvasElement>document.createElement('canvas');
            // this._canvas.setAttribute('overflow', 'hidden');
            this._canvasElement.setAttribute('id', 'xts-canvas');
            if (this._properties.width && !this._properties.fullscreen) {
                this._canvasElement.width = this._properties.width;
            }
            else {
                this._canvasElement.width = window.innerWidth;
            }
            if (this._properties.height && !this._properties.fullscreen) {
                this._canvasElement.height = this._properties.height;
            }
            else {
                this._canvasElement.height = window.innerHeight;
            }
            document.body.appendChild(this._canvasElement);
        }

        this.init();
    }

    public get context(): WebGLContext {
        return this._canvas.context;
    }

    public get engine(): IEngine {
        return this._engine;
    }

    public get keyBoardObservable(): Observable<KeyBoardInfo> {
        return this._keyBoardObservable;
    }

    public get pointerObservable(): Observable<PointerInfo> {
        return this._pointerObservable;
    }

    public get width(): number {
        return this._canvasElement.width;
    }

    public get height(): number {
        return this._canvasElement.height;
    }
    
    public get canvas(): HTMLCanvasElement {
        return this._canvasElement;
    }
    
    public get vsync(): boolean {
        return this._properties.vsync;
    }

    public set vsync(vsync: boolean) {
        this._properties.vsync = vsync;
    }

    public setEventsCallback(cb: (event: InputEvent) => void): void {
        this._eventCallback = cb;
        InputManager.setEventCallback(cb);
    }

    public clear(): void {
        Renderer.clear(RendererBufferType.COLOR | RendererBufferType.DEPTH);
    }

    public update(step: TimeStep): void {
        InputManager.update(0);
    }

    public addEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: any, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void {
        window.addEventListener(type, listener, options)
    }

    public removeEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: any, ev: WindowEventMap[K]) => any, options?: boolean | EventListenerOptions): void {
        window.removeEventListener(type, listener, options);
    }

    /*
        Private
    */

    private init(): void {
        // GLUtils.initialize(this);
        this._canvas = new Canvas(this._canvasElement, {fullscreen: this._properties.fullscreen});

        Renderer.init(this._canvas.context, this._properties.color);

        InputManager.init(this._engine);
        InputManager.attach(this);

        this._inputManager.attachControl();

        let anyDoc = document as any;

        // Fullscreen
        const _onFullscreenChange = () => {

            if (anyDoc.fullscreen !== undefined) {
                this._isFullscreen = anyDoc.fullscreen;
            } else if (anyDoc.mozFullScreen !== undefined) {
                this._isFullscreen = anyDoc.mozFullScreen;
            } else if (anyDoc.webkitIsFullScreen !== undefined) {
                this._isFullscreen = anyDoc.webkitIsFullScreen;
            } else if (anyDoc.msIsFullScreen !== undefined) {
                this._isFullscreen = anyDoc.msIsFullScreen;
            }

            console.log('_onFullscreenChange, isFullScreen ?', this._isFullscreen);
            if (!this._isFullscreen) {
                this._canvas.resetSize();
            }
        };

        document.addEventListener("fullscreenchange", _onFullscreenChange, false);
        document.addEventListener("mozfullscreenchange", _onFullscreenChange, false);
        document.addEventListener("webkitfullscreenchange", _onFullscreenChange, false);
        document.addEventListener("msfullscreenchange", _onFullscreenChange, false);
        
        this._keyBoardObservable.add((eventData: KeyBoardInfo) => {
            if (eventData.event.keyCode === 122 && eventData.type === KeyBoardEventType.KEYDOWN) {
                eventData.event.preventDefault();
                eventData.event.stopPropagation();
                return this._canvas.requestFullscreen();
            }
        });

        /*
        this.addEventListener('keydown', InputManager.keyboardCallback);
        this.addEventListener('keyup', InputManager.keyboardCallback);

        this._canvas.addEventListener('contextmenu', (event: MouseEvent) => {
            event.preventDefault();
        });
        this._canvas.addEventListener('mousedown', InputManager.mouseCallback);
        this._canvas.addEventListener('mouseup', InputManager.mouseCallback);

        this._canvas.addEventListener('mousemove', InputManager.mouseCallback);

        this._canvas.addEventListener('wheel', InputManager.mouseCallback);

        */
       /*
        this.addEventListener('resize', (event: UIEvent) => {
            if (this._properties.fullscreen) {
                this._properties.width = window.innerWidth;
                this._properties.height = window.innerHeight;
                this._canvasElement.width = window.innerWidth;
                this._canvasElement.height = window.innerHeight;
                this._canvas.context.gl.viewport(0, 0, this.width, this.height);
            }
        });
        */

    }

}
