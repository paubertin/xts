import { Logger } from "../utils/log";
import { BIT } from "../utils";
import { int, bool } from "../utils/types";
import { Color } from "./color";
import { WebGLContext } from "../gl/webglContext";

export type DrawMode = 'POINTS'
    | 'LINE_STRIP'
    | 'LINE_LOOP'
    | 'LINES'
    | 'TRIANGLE_STRIP'
    | 'TRIANGLE_FAN'
    | 'TRIANGLES';

enum RendererBlendFunction {
    NONE,
    ZERO,
    ONE,
    SOURCE_ALPHA,
    DESTINATION_ALPHA,
    ONE_MINUS_SOURCE_ALPHA
}

export function DrawModeToGL(gl: WebGL2RenderingContext, drawMode: DrawMode): GLenum {
    switch (drawMode) {
        case 'POINTS': return gl.POINTS;
        case 'LINE_STRIP': return gl.LINE_STRIP;
        case 'LINE_LOOP': return gl.LINE_LOOP;
        case 'LINES': return gl.LINES;
        case 'TRIANGLES': return gl.TRIANGLES;
        case 'TRIANGLE_STRIP': return gl.TRIANGLE_STRIP;
        case 'TRIANGLE_FAN': return gl.TRIANGLE_FAN;
    }
}

function RendererBlendFunctionToGL(gl: WebGL2RenderingContext, blendFunction: RendererBlendFunction): GLenum {
    switch (blendFunction) {
        case RendererBlendFunction.ZERO: return gl.ZERO;
        case RendererBlendFunction.ONE: return gl.ONE;
        case RendererBlendFunction.SOURCE_ALPHA: return gl.SRC_ALPHA;
        case RendererBlendFunction.DESTINATION_ALPHA: return gl.DST_ALPHA;
        case RendererBlendFunction.ONE_MINUS_SOURCE_ALPHA: return gl.ONE_MINUS_SRC_ALPHA;
        default: return 0;
    }
}

export enum RendererBufferType {
    NONE    = 0,
    COLOR   = BIT(1),
    DEPTH   = BIT(2),
    STENCIL = BIT(3),
}

function RendererBufferToGL (gl: WebGL2RenderingContext, buffer: GLenum): GLenum {
    let result = 0;
    if (buffer & RendererBufferType.COLOR) result |= gl.COLOR_BUFFER_BIT;
    if (buffer & RendererBufferType.DEPTH) result |= gl.DEPTH_BUFFER_BIT;
    if (buffer & RendererBufferType.STENCIL) result |= gl.STENCIL_BUFFER_BIT;
    return result;
}

export class Renderer {
    
    public static init(context: WebGLContext, clearColor: Color = new Color()): void {
        Renderer._instance = new Renderer(context);
        Renderer._instance.init(clearColor);
    }

    public static clear(buffer: GLenum): void {
        Renderer._instance.clear(buffer);
    }

    /*
        Private
    */

    private static _instance: Renderer;

    private _context: WebGLContext;

    private constructor(context: WebGLContext) {
        this._context = context;
    }

    private static get instance(): Renderer {
        if (!Renderer._instance) {
            throw new Error('Renderer not instanciated');
        }
        return Renderer._instance;
    }
    
    private init(clearColor: Color): void {
        const gl = this._context.gl;
        this.setDepthTesting(true);
        this.setBlend(true);
        
        this.setBlendFunction(RendererBlendFunction.SOURCE_ALPHA, RendererBlendFunction.ONE_MINUS_SOURCE_ALPHA);

        Logger.info('WebGL Initialized');
        Logger.info('  version:       ', gl.getParameter(gl.VERSION));
        Logger.info('  vendor:        ', gl.getParameter((gl.getExtension('WEBGL_debug_renderer_info') as WEBGL_debug_renderer_info).UNMASKED_VENDOR_WEBGL));
        Logger.info('  renderer:      ', gl.getParameter((gl.getExtension('WEBGL_debug_renderer_info') as WEBGL_debug_renderer_info).UNMASKED_RENDERER_WEBGL));
        Logger.info('  glsl version:  ', gl.getParameter(gl.SHADING_LANGUAGE_VERSION));

        gl.clearColor(...clearColor.toArray());
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);

        gl.depthFunc(gl.LEQUAL);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    private clear(buffer: GLenum): void {
        const gl = this._context.gl;
        gl.clear(RendererBufferToGL(gl, buffer));
    }

    private setDepthTesting(enabled: bool): void {
        const gl = this._context.gl;
        if (enabled) {
            gl.enable(gl.DEPTH_TEST);
        }
        else {
            gl.disable(gl.DEPTH_TEST);
        }
    }

    private setBlend(enabled: bool): void {
        const gl = this._context.gl;
        if (enabled) {
            gl.enable(gl.BLEND);
        }
        else {
            gl.disable(gl.BLEND);
        }
    }

    private setBlendFunction(source: RendererBlendFunction, dest: RendererBlendFunction): void {
        const gl = this._context.gl;
        gl.blendFunc(RendererBlendFunctionToGL(gl, source), RendererBlendFunctionToGL(gl, dest));
    }
}