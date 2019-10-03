import { gl } from "src/core/gl";

export function error(msg: string) {
    window.console.error(msg);
}

export const origConsole: any = {};

export function setupConsole() {
    const parent = document.createElement('div');
    parent.className = 'console';
    Object.assign(parent.style, {
        fontFamily: 'monospace',
        fontSize: 'medium',
        maxHeight: '30%',
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        overflow: 'auto',
        background: 'rgba(0, 0, 0, 0.75)',
    });
    const toggle = document.createElement('div');
    let show = false;
    Object.assign(toggle.style, {
        position: 'absolute',
        right: 0,
        bottom: 0,
        background: '#EEE',
        'font-size': 'smaller',
        cursor: 'pointer',
    });
    toggle.addEventListener('click', showHideConsole);

    function showHideConsole() {
        show = !show;
        toggle.textContent = show ? '☒' : '☐';
        parent.style.display = show ? '' : 'none';
    }
    showHideConsole();

    const maxLines = 100;
    const lines: HTMLDivElement[] = [];
    let added = false;

    function addLine(type: string, str: string | null, color: string | null, prefix: string) {
        const div = document.createElement('div');
        div.textContent = prefix + str;
        div.className = type;
        div.style.color = color;
        parent.appendChild(div);
        lines.push(div);
        if (!added) {
            added = true;
            document.body.appendChild(parent);
            document.body.appendChild(toggle);
        }
        // scrollIntoView only works in Chrome
        // In Firefox and Safari scrollIntoView inside an iframe moves
        // that element into the view. It should argably only move that
        // element inside the iframe itself, otherwise that's giving
        // any random iframe control to bring itself into view against
        // the parent's wishes.
        //
        // note that even if we used a solution (which is to manually set
        // scrollTop) there's a UI issue that if the user manaully scrolls
        // we want to stop scrolling automatically and if they move back
        // to the bottom we want to pick up scrolling automatically.
        // Kind of a PITA so TBD
        //
        div.scrollIntoView();
    }

    function addLines(type: string, str: string | null, color: string | null, prefix: string) {
        while (lines.length > maxLines) {
            const div = lines.shift();
            div!.parentNode!.removeChild(div!);
        }
        addLine(type, str, color, prefix);
    }

    function wrapFunc(obj: any, funcName: string, color: string, prefix: string) {
        const oldFn = obj[funcName];
        origConsole[funcName] = oldFn.bind(obj);
        return function (...args: any[]) {
            addLines(funcName, [...args].join(' '), color, prefix);
            oldFn.apply(obj, arguments);
        };
    }

    window.console.log = wrapFunc(window.console, 'log', 'white', '');
    window.console.warn = wrapFunc(window.console, 'warn', 'orange', ''); // '⚠');
    window.console.error = wrapFunc(window.console, 'error', '#ff8a8a', ''); // '❌');
}

/**
 * Loads a shader.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} shaderSource The shader source.
 * @param {GLenum} shaderType The type of shader.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
 * @return {WebGLShader} The created shader.
 */
export function loadShader(shaderSource: string, shaderType: GLenum, opt_errorCallback?: (msg: string) => void): WebGLShader | null {
    const errFn = opt_errorCallback || error;
    // Create the shader object
    const shader = gl.createShader(shaderType)!;

    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        // Something went wrong during compilation; get the error
        const lastError = gl.getShaderInfoLog(shader);
        errFn("*** Error compiling shader '" + shader + "':" + lastError);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}


/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 * @param {WebGLShader[]} shaders The shaders to attach
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @memberOf module:webgl-utils
 */
export function createProgram(shaders: WebGLShader[], opt_attribs?: string[], opt_locations?: number[], opt_errorCallback?: (msg: string) => void): WebGLProgram | null {
    const errFn = opt_errorCallback || error;
    const program = gl.createProgram()!;
    shaders.forEach(function (shader) {
        gl.attachShader(program, shader);
    });
    if (opt_attribs) {
        opt_attribs.forEach(function (attrib, ndx) {
            gl.bindAttribLocation(
                program,
                opt_locations ? opt_locations[ndx] : ndx,
                attrib);
        });
    }
    gl.linkProgram(program);

    // Check the link status
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        const lastError = gl.getProgramInfoLog(program);
        errFn("Error in program linking:" + lastError);

        gl.deleteProgram(program);
        return null;
    }
    return program;
}

const defaultShaderType = [
    "VERTEX_SHADER",
    "FRAGMENT_SHADER",
];

/**
 * Creates a program from 2 sources.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSourcess Array of sources for the
 *        shaders. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram} The created program.
 * @memberOf module:webgl-utils
 */
export function createProgramFromSources(shaderSources: string[], opt_attribs?: string[], opt_locations?: number[], opt_errorCallback?: (msg: string) => void): WebGLProgram | null {
    const shaders: WebGLShader[] = [];
    for (let ii = 0; ii < shaderSources.length; ++ii) {
        shaders.push(loadShader(shaderSources[ii], (gl as any)[defaultShaderType[ii]], opt_errorCallback)!);
    }
    return createProgram(shaders, opt_attribs, opt_locations, opt_errorCallback);
}