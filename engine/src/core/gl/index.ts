import { IWindow } from '../application/window'
import { Logger } from '../utils/log';
import { WebGLDebugUtils } from './debug';

export let gl: WebGL2RenderingContext; // = document.createElement('canvas').getContext('webgl2') as WebGL2RenderingContext;

function throwOnGLError(err: number, funcName: string, args: any) {
    throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
};

function logGLCall(functionName: string, args: any) {
    console.log("gl." + functionName + "(" +
        WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
}

export namespace GLUtils {
    export function initialize(win: IWindow): void {
        /*
        let options: WebGLContextAttributes = {
            alpha: true,
            antialias: true,
            depth: true,
            desynchronized: false,
            failIfMajorPerformanceCaveat: true,
            powerPreference: 'high-performance',
            premultipliedAlpha: true,
            preserveDrawingBuffer: true,
            stencil: true,
        };
        */
        gl = win.canvas.getContext('webgl2') as WebGL2RenderingContext;
        if (!gl) {
            throw new Error('Could not initialize WebGL');
        }
        // gl = WebGLDebugUtils.makeDebugContext(gl);
        (<any>window).gl = gl;
    }
}