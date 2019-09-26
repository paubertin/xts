import { gl } from "../gl";
import { Logger } from "../utils/log";
import { BIT } from "../utils";
import { int, bool } from "../utils/types";
import { Color } from "./color";

enum RendererBlendFunction {
    NONE,
    ZERO,
    ONE,
    SOURCE_ALPHA,
    DESTINATION_ALPHA,
    ONE_MINUS_SOURCE_ALPHA
}

function RendererBlendFunctionToGL(blendFunction: RendererBlendFunction): GLenum {
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

function RendererBufferToGL (buffer: GLenum): GLenum {
    let result = 0;
    if (buffer & RendererBufferType.COLOR) result |= gl.COLOR_BUFFER_BIT;
    if (buffer & RendererBufferType.DEPTH) result |= gl.DEPTH_BUFFER_BIT;
    if (buffer & RendererBufferType.STENCIL) result |= gl.STENCIL_BUFFER_BIT;
    return result;
}

export class Renderer {
    
    public static init(clearColor: Color = new Color()): void {
        Renderer._instance = new Renderer();
        Renderer.instance.init(clearColor);
    }

    public static clear(buffer: GLenum): void {
        Renderer.instance.clear(buffer);
    }

    /*
        Private
    */

    private static _instance: Renderer;

    private constructor() {}

    private static get instance(): Renderer {
        if (!Renderer._instance) {
            throw new Error('Renderer not instanciated');
        }
        return Renderer._instance;
    }
    
    private init(clearColor: Color): void {
        this.setDepthTesting(true);
        this.setBlend(true);
        
        this.setBlendFunction(RendererBlendFunction.SOURCE_ALPHA, RendererBlendFunction.ONE_MINUS_SOURCE_ALPHA);

        Logger.info('WebGL Initialized');
        Logger.info('  version:       ', gl.getParameter(gl.VERSION));
        Logger.info('  vendor:        ', gl.getParameter((gl.getExtension('WEBGL_debug_renderer_info') as WEBGL_debug_renderer_info).UNMASKED_VENDOR_WEBGL));
        Logger.info('  renderer:      ', gl.getParameter((gl.getExtension('WEBGL_debug_renderer_info') as WEBGL_debug_renderer_info).UNMASKED_RENDERER_WEBGL));
        Logger.info('  glsl version:  ', gl.getParameter(gl.SHADING_LANGUAGE_VERSION));

        gl.clearColor(...clearColor.toArray());
        // gl.enable(gl.CULL_FACE);
        // gl.frontFace(gl.CCW);
        // gl.cullFace(gl.FRONT);
    }

    private clear(buffer: GLenum): void {
        gl.clear(RendererBufferToGL(buffer));
    }

    private setDepthTesting(enabled: bool): void {
        if (enabled) {
            gl.enable(gl.DEPTH_TEST);
        }
        else {
            gl.disable(gl.DEPTH_TEST);
        }
    }

    private setBlend(enabled: bool): void {
        if (enabled) {
            gl.enable(gl.BLEND);
        }
        else {
            gl.disable(gl.BLEND);
        }
    }

    private setBlendFunction(source: RendererBlendFunction, dest: RendererBlendFunction): void {
        gl.blendFunc(RendererBlendFunctionToGL(source), RendererBlendFunctionToGL(dest));
    }
}