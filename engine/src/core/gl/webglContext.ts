import { bool } from "../utils/types";
import { WebGLDebugUtils } from "./debug";
import { Logger } from "../utils/log";
import { uuid } from "../maths";
import { ID } from "./glObject";

export interface WebGLContextOptions extends WebGLContextAttributes {
    debug?: bool;
    fullscreen?: bool;
}

export class WebGLContext {
    protected _context: WebGL2RenderingContext;
    protected _attributes: WebGLContextAttributes | undefined = undefined;
    protected _extensions: string[] = [];
    protected _registeredObjects: string[] = [];

    private static DEFAULT_ATTRIBUTES: WebGLContextOptions = {
        alpha: true,
        antialias: false,
        debug: true,
        depth: true,
        failIfMajorPerformanceCaveat: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        stencil: false,
    };

    public static init(element: HTMLCanvasElement, attributes: WebGLContextOptions = WebGLContext.DEFAULT_ATTRIBUTES): WebGLContext {
        let context = element.getContext('webgl2', attributes);
        if (!context) {
            throw new Error('Could not initialize WebGL');
        }
        if (attributes.debug) {
            context = WebGLDebugUtils.makeDebugContext(context);
        }
        return new WebGLContext(context!);
    }

    public get gl(): WebGL2RenderingContext {
        return this._context;
    }

    protected constructor(context: WebGL2RenderingContext) {
        this._context = context;

        const attributes = this._context.getContextAttributes();
        if (attributes === null) {
            Logger.error('Could not query context attributes');
        }
        else {
            this._attributes = attributes;
        }

        const extensions = this._context.getSupportedExtensions();
        if (extensions === null) {
            Logger.error('Could not query context supported extensions');
        }
        else {
            this._extensions = extensions;
        }
    }

    public supports(extension: string): bool {
        return this._extensions.includes(extension);
    }

    public register<T extends ID>(object: T): string {
        if (this._registeredObjects.includes(object.id)) {
            Logger.error(`Object ${object.id} already registered.`);
        }
        const _uuid = uuid();
        this._registeredObjects.push(_uuid);
        return _uuid;
    }

    public unregister(id: string): void {
        if (!this._registeredObjects.includes(id)) {
            Logger.error(`Object ${id} is not registered.`);
        }
        const idx = this._registeredObjects.findIndex((o) => o === id);
        this._registeredObjects.splice(idx, 1);
    }

}