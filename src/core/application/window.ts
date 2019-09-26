import { Logger, warn } from '../utils/log';
import { gl, GLUtils } from '../gl';
import { Renderer, RendererBufferType } from '../graphics/renderer';
import { InputManager } from '../input/inputManager';
import { InputEvent } from '../events/inputEvent';
import { Color } from '../graphics/color';
import { Nullable } from '../utils/types';
import { IEngine } from './engine';
import { TimeStep } from '../utils/timestep';
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
    private _canvas!: HTMLCanvasElement;
    private _engine: IEngine;
    private _title: string;
    private _eventCallback: Nullable<(event: InputEvent) => void> = null;

    constructor (engine: IEngine, title: string = 'window', properties: Partial<IWindowProperties> = {}) {
        this._engine = engine;
        this._properties = { ...defaultWindowProperties, ...properties };
        this._title = title;
        if (this._properties.element !== undefined) {
            this._canvas = <HTMLCanvasElement>document.getElementById(this._properties.element);
            if (!this._canvas) {
                throw new Error(`Cannot find a canvas element named: ${this._properties.element}`);
            }
        }
        else {
            this._canvas = <HTMLCanvasElement>document.createElement('canvas');
            // this._canvas.setAttribute('overflow', 'hidden');
            this._canvas.setAttribute('id', 'xts-canvas');
            if (this._properties.width && !this._properties.fullscreen) {
                this._canvas.width = this._properties.width;
            }
            else {
                this._canvas.width = window.innerWidth;
            }
            if (this._properties.height && !this._properties.fullscreen) {
                this._canvas.height = this._properties.height;
            }
            else {
                this._canvas.height = window.innerHeight;
            }
            document.body.appendChild(this._canvas);
        }

        this.init();
    }

    public get width(): number {
        return this._canvas.width;
    }

    public get height(): number {
        return this._canvas.height;
    }
    
    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }
    
    public get vsync(): boolean {
        return this._properties.vsync;
    }

    public set vsync(vsync: boolean) {
        this._properties.vsync = vsync;
    }

    private onResize(width: number, height: number): void {
        Logger.debug('onResize: ', width, height);
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
        gl.viewport(0, 0, this.width, this.height);
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
        GLUtils.initialize(this);

        Renderer.init(this._properties.color);

        InputManager.init(this._engine);
        InputManager.attach(this);

        this.addEventListener('keydown', InputManager.keyboardCallback);
        this.addEventListener('keyup', InputManager.keyboardCallback);

        this._canvas.addEventListener('contextmenu', (event: MouseEvent) => {
            event.preventDefault();
        });
        this._canvas.addEventListener('mousedown', InputManager.mouseCallback);
        this._canvas.addEventListener('mouseup', InputManager.mouseCallback);

        this._canvas.addEventListener('mousemove', InputManager.mouseCallback);

        this._canvas.addEventListener('wheel', InputManager.mouseCallback);

        this.addEventListener('resize', (event: UIEvent) => {
            if (this._properties.fullscreen) {
                this._properties.width = window.innerWidth;
                this._properties.height = window.innerHeight;
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;
                gl.viewport(0, 0, this.width, this.height);
            }
        });

    }

}
