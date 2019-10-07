import { Resizable } from "../resizable";
import { Logger } from "../utils/log";
import { WebGLContext, WebGLContextOptions } from "../gl/webglContext";
import { Color } from "../graphics/color";
import { GLsizei2, GLclampf2 } from "../utils/tuples";
import { Vec2 } from "../maths";

export class Canvas extends Resizable {
    private _element: HTMLCanvasElement;
    protected _context: WebGLContext;
    protected _clearColor: Color;

    protected _attributes: WebGLContextOptions;

    protected _renderer: any;
    protected _controller: any;

    protected _size: GLsizei2 = [0, 0];
    protected _baseSize: GLsizei2;
    protected _frameSize!: GLsizei2;
    protected _frameScale!: GLclampf2;

    protected static readonly DEFAULT_CLEAR_COLOR: Color = new Color(0.2, 0.2, 0.2);
    
    public constructor(element: HTMLCanvasElement | string, attributes: WebGLContextOptions = {}) {
        super();

        this._attributes = attributes;

        if (element instanceof HTMLCanvasElement) {
            this._element = element;
        }
        else {
            const elt = document.getElementById(element);
            if (!elt) throw new Error(`Cannot find a canvas element with id: ${element}`);
            this._element = <HTMLCanvasElement>elt;
        }

        this.observe(this._element);

        // mouse
        // keyboard

        this._context = WebGLContext.init(this._element, attributes);
        
        // configure controller

        this.configureSizeAndScale();

        this._baseSize = this._size;

        this._clearColor = Canvas.DEFAULT_CLEAR_COLOR;
    }

    public get size(): GLsizei2 {
        return this._size;
    }

    public get context(): WebGLContext {
        return this._context;
    }

    public get frameScale(): GLclampf2 {
        return this._frameScale;
    }

    public requestFullscreen(): Promise<void> {
        console.log('request full screen');
        return this._element.requestFullscreen();
    }

    public resetSize() {
        this._element.width = this._baseSize[0];
        this._element.height = this._baseSize[1];
    }

    public set frameScale(frameScale: GLclampf2) {
        if (!isFinite(frameScale[0]) || !isFinite(frameScale[1])) return;

        let scale = Vec2.clamp(frameScale, 0.0, 1.0);
        const size = new Vec2(this._size);
        size.mult(scale);
        size.max([1.0, 1.0]);
        size.round();

        scale = Vec2.div(size, this._size);

        this._frameScale = scale.toArray();
        this._frameSize = size.toArray();

        // dispatch scale event
        // dispatch size event

        if (this._renderer) this._renderer.frameSize = this._frameSize;
    }

    protected retrieveSize(): void {
        if (this._attributes.fullscreen) {
            this._size[0] = window.innerWidth;
            this._size[1] = window.innerHeight;
            return;
        }
        const size = Resizable.elementSize(this._element);
        if (!size) {
            this._size = [0, 0];
            return;
        }
        if (size[0] === this._size[0] && size[1] === this._size[1]) return;
        this._size = [size[0], size[1]];
        // TODO
        // dispatch size event
    }

    protected onResize(cacheSize: boolean = false): void {
        if (cacheSize) {
            this._baseSize = this._size;
        }

        this.retrieveSize();

        this._element.width = this._size[0];
        this._element.height = this._size[1];

        Logger.log('size', this._baseSize, this._size);

        if (this._renderer) this._controller.block();

        this.frameScale = this._frameScale;

        if (this._renderer) {
            this._controller.unblock();
            this._renderer.swap();
        }

        this._context.gl.viewport(0, 0, this._size[0], this._size[1]);
    }

    protected configureSizeAndScale(): void {
        this._frameScale = [1.0, 1.0];
        this._frameSize = [this._size[0], this._size[1]];
        this.onResize();
    }
}