/*
** Copyright (c) 2012 The Khronos Group Inc.
**
** Permission is hereby granted, free of charge, to any person obtaining a
** copy of this software and/or associated documentation files (the
** "Materials"), to deal in the Materials without restriction, including
** without limitation the rights to use, copy, modify, merge, publish,
** distribute, sublicense, and/or sell copies of the Materials, and to
** permit persons to whom the Materials are furnished to do so, subject to
** the following conditions:
**
** The above copyright notice and this permission notice shall be included
** in all copies or substantial portions of the Materials.
**
** THE MATERIALS ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
** EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
** MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
** IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
** CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
** TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
** MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.
*/

namespace internal {

    /**
     * Wrapped logging function.
     * @param {string} msg Message to log.
     */
    function log(msg: string): void {
        if (window.console && window.console.log) {
            window.console.log(msg);
        }
    };

    /**
* Wrapped error logging function.
* @param {string} msg Message to log.
*/
    function error(msg: string): void {
        if (window.console && window.console.error) {
            window.console.error(msg);
        } else {
            log(msg);
        }
    };

    /**
 * Which arguments are enums based on the number of arguments to the function.
 * So
 *    'texImage2D': {
 *       9: { 0:true, 2:true, 6:true, 7:true },
 *       6: { 0:true, 2:true, 3:true, 4:true },
 *    },
 *
 * means if there are 9 arguments then 6 and 7 are enums, if there are 6
 * arguments 3 and 4 are enums
 *
 * @type {!Object.<number, !Object.<number, string>}
 */
    const glValidEnumContexts = {
        // Generic setters and getters

        'enable': { 1: { 0: true } },
        'disable': { 1: { 0: true } },
        'getParameter': { 1: { 0: true } },

        // Rendering

        'drawArrays': { 3: { 0: true } },
        'drawElements': { 4: { 0: true, 2: true } },

        // Shaders

        'createShader': { 1: { 0: true } },
        'getShaderParameter': { 2: { 1: true } },
        'getProgramParameter': { 2: { 1: true } },
        'getShaderPrecisionFormat': { 2: { 0: true, 1: true } },

        // Vertex attributes

        'getVertexAttrib': { 2: { 1: true } },
        'vertexAttribPointer': { 6: { 2: true } },

        // Textures

        'bindTexture': { 2: { 0: true } },
        'activeTexture': { 1: { 0: true } },
        'getTexParameter': { 2: { 0: true, 1: true } },
        'texParameterf': { 3: { 0: true, 1: true } },
        'texParameteri': { 3: { 0: true, 1: true, 2: true } },
        // texImage2D and texSubImage2D are defined below with WebGL 2 entrypoints
        'copyTexImage2D': { 8: { 0: true, 2: true } },
        'copyTexSubImage2D': { 8: { 0: true } },
        'generateMipmap': { 1: { 0: true } },
        // compressedTexImage2D and compressedTexSubImage2D are defined below with WebGL 2 entrypoints

        // Buffer objects

        'bindBuffer': { 2: { 0: true } },
        // bufferData and bufferSubData are defined below with WebGL 2 entrypoints
        'getBufferParameter': { 2: { 0: true, 1: true } },

        // Renderbuffers and framebuffers

        'pixelStorei': { 2: { 0: true, 1: true } },
        // readPixels is defined below with WebGL 2 entrypoints
        'bindRenderbuffer': { 2: { 0: true } },
        'bindFramebuffer': { 2: { 0: true } },
        'checkFramebufferStatus': { 1: { 0: true } },
        'framebufferRenderbuffer': { 4: { 0: true, 1: true, 2: true } },
        'framebufferTexture2D': { 5: { 0: true, 1: true, 2: true } },
        'getFramebufferAttachmentParameter': { 3: { 0: true, 1: true, 2: true } },
        'getRenderbufferParameter': { 2: { 0: true, 1: true } },
        'renderbufferStorage': { 4: { 0: true, 1: true } },

        // Frame buffer operations (clear, blend, depth test, stencil)

        'clear': { 1: { 0: { 'enumBitwiseOr': ['COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT', 'STENCIL_BUFFER_BIT'] } } },
        'depthFunc': { 1: { 0: true } },
        'blendFunc': { 2: { 0: true, 1: true } },
        'blendFuncSeparate': { 4: { 0: true, 1: true, 2: true, 3: true } },
        'blendEquation': { 1: { 0: true } },
        'blendEquationSeparate': { 2: { 0: true, 1: true } },
        'stencilFunc': { 3: { 0: true } },
        'stencilFuncSeparate': { 4: { 0: true, 1: true } },
        'stencilMaskSeparate': { 2: { 0: true } },
        'stencilOp': { 3: { 0: true, 1: true, 2: true } },
        'stencilOpSeparate': { 4: { 0: true, 1: true, 2: true, 3: true } },

        // Culling

        'cullFace': { 1: { 0: true } },
        'frontFace': { 1: { 0: true } },

        // ANGLE_instanced_arrays extension

        'drawArraysInstancedANGLE': { 4: { 0: true } },
        'drawElementsInstancedANGLE': { 5: { 0: true, 2: true } },

        // EXT_blend_minmax extension

        'blendEquationEXT': { 1: { 0: true } },

        // WebGL 2 Buffer objects

        'bufferData': {
            3: { 0: true, 2: true }, // WebGL 1
            4: { 0: true, 2: true }, // WebGL 2
            5: { 0: true, 2: true }  // WebGL 2
        },
        'bufferSubData': {
            3: { 0: true }, // WebGL 1
            4: { 0: true }, // WebGL 2
            5: { 0: true }  // WebGL 2
        },
        'copyBufferSubData': { 5: { 0: true, 1: true } },
        'getBufferSubData': { 3: { 0: true }, 4: { 0: true }, 5: { 0: true } },

        // WebGL 2 Framebuffer objects

        'blitFramebuffer': { 10: { 8: { 'enumBitwiseOr': ['COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT', 'STENCIL_BUFFER_BIT'] }, 9: true } },
        'framebufferTextureLayer': { 5: { 0: true, 1: true } },
        'invalidateFramebuffer': { 2: { 0: true } },
        'invalidateSubFramebuffer': { 6: { 0: true } },
        'readBuffer': { 1: { 0: true } },

        // WebGL 2 Renderbuffer objects

        'getInternalformatParameter': { 3: { 0: true, 1: true, 2: true } },
        'renderbufferStorageMultisample': { 5: { 0: true, 2: true } },

        // WebGL 2 Texture objects

        'texStorage2D': { 5: { 0: true, 2: true } },
        'texStorage3D': { 6: { 0: true, 2: true } },
        'texImage2D': {
            9: { 0: true, 2: true, 6: true, 7: true }, // WebGL 1 & 2
            6: { 0: true, 2: true, 3: true, 4: true }, // WebGL 1
            10: { 0: true, 2: true, 6: true, 7: true } // WebGL 2
        },
        'texImage3D': {
            10: { 0: true, 2: true, 7: true, 8: true },
            11: { 0: true, 2: true, 7: true, 8: true }
        },
        'texSubImage2D': {
            9: { 0: true, 6: true, 7: true }, // WebGL 1 & 2
            7: { 0: true, 4: true, 5: true }, // WebGL 1
            10: { 0: true, 6: true, 7: true } // WebGL 2
        },
        'texSubImage3D': {
            11: { 0: true, 8: true, 9: true },
            12: { 0: true, 8: true, 9: true }
        },
        'copyTexSubImage3D': { 9: { 0: true } },
        'compressedTexImage2D': {
            7: { 0: true, 2: true }, // WebGL 1 & 2
            8: { 0: true, 2: true }, // WebGL 2
            9: { 0: true, 2: true }  // WebGL 2
        },
        'compressedTexImage3D': {
            8: { 0: true, 2: true },
            9: { 0: true, 2: true },
            10: { 0: true, 2: true }
        },
        'compressedTexSubImage2D': {
            8: { 0: true, 6: true }, // WebGL 1 & 2
            9: { 0: true, 6: true }, // WebGL 2
            10: { 0: true, 6: true } // WebGL 2
        },
        'compressedTexSubImage3D': {
            10: { 0: true, 8: true },
            11: { 0: true, 8: true },
            12: { 0: true, 8: true }
        },

        // WebGL 2 Vertex attribs

        'vertexAttribIPointer': { 5: { 2: true } },

        // WebGL 2 Writing to the drawing buffer

        'drawArraysInstanced': { 4: { 0: true } },
        'drawElementsInstanced': { 5: { 0: true, 2: true } },
        'drawRangeElements': { 6: { 0: true, 4: true } },

        // WebGL 2 Reading back pixels

        'readPixels': {
            7: { 4: true, 5: true }, // WebGL 1 & 2
            8: { 4: true, 5: true }  // WebGL 2
        },

        // WebGL 2 Multiple Render Targets

        'clearBufferfv': { 3: { 0: true }, 4: { 0: true } },
        'clearBufferiv': { 3: { 0: true }, 4: { 0: true } },
        'clearBufferuiv': { 3: { 0: true }, 4: { 0: true } },
        'clearBufferfi': { 4: { 0: true } },

        // WebGL 2 Query objects

        'beginQuery': { 2: { 0: true } },
        'endQuery': { 1: { 0: true } },
        'getQuery': { 2: { 0: true, 1: true } },
        'getQueryParameter': { 2: { 1: true } },

        // WebGL 2 Sampler objects

        'samplerParameteri': { 3: { 1: true, 2: true } },
        'samplerParameterf': { 3: { 1: true } },
        'getSamplerParameter': { 2: { 1: true } },

        // WebGL 2 Sync objects

        'fenceSync': { 2: { 0: true, 1: { 'enumBitwiseOr': [] } } },
        'clientWaitSync': { 3: { 1: { 'enumBitwiseOr': ['SYNC_FLUSH_COMMANDS_BIT'] } } },
        'waitSync': { 3: { 1: { 'enumBitwiseOr': [] } } },
        'getSyncParameter': { 2: { 1: true } },

        // WebGL 2 Transform Feedback

        'bindTransformFeedback': { 2: { 0: true } },
        'beginTransformFeedback': { 1: { 0: true } },
        'transformFeedbackVaryings': { 3: { 2: true } },

        // WebGL2 Uniform Buffer Objects and Transform Feedback Buffers

        'bindBufferBase': { 3: { 0: true } },
        'bindBufferRange': { 5: { 0: true } },
        'getIndexedParameter': { 2: { 0: true } },
        'getActiveUniforms': { 3: { 2: true } },
        'getActiveUniformBlockParameter': { 3: { 2: true } }
    };

    /**
     * Map of numbers to names.
     * @type {Object}
     */
    var glEnums: any = null;

    /**
     * Map of names to numbers.
     * @type {Object}
     */
    var enumStringToValue: any = null;

    /**
     * Initializes this module. Safe to call more than once.
     * @param {!WebGL2RenderingContext} ctx A WebGL context. If
     *    you have more than one context it doesn't matter which one
     *    you pass in, it is only used to pull out constants.
     */
    export function init(ctx: WebGL2RenderingContext): void {
        if (glEnums == null) {
            glEnums = {};
            enumStringToValue = {};
            for (var propertyName in ctx) {
                if (typeof (ctx as any)[propertyName] == 'number') {
                    glEnums[(ctx as any)[propertyName]] = propertyName;
                    enumStringToValue[propertyName] = (ctx as any)[propertyName];
                }
            }
        }
    }

    /**
 * Checks the utils have been initialized.
 */
    function checkInit(): void {
        if (glEnums == null) {
            throw 'WebGLDebugUtils.init(ctx) not called';
        }
    }

    /**
     * Returns true or false if value matches any WebGL enum
     * @param {*} value Value to check if it might be an enum.
     * @return {boolean} True if value matches one of the WebGL defined enums
     */
    export function mightBeEnum(value: any): boolean {
        checkInit();
        return (glEnums[value] !== undefined);
    }

    /**
     * Gets an string version of an WebGL enum.
     *
     * Example:
     *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
     *
     * @param {number} value Value to return an enum for
     * @return {string} The string version of the enum.
     */
    export function glEnumToString(value: number): string {
        checkInit();
        var name = glEnums[value];
        return (name !== undefined) ? ("gl." + name) :
            ("/*UNKNOWN WebGL ENUM*/ 0x" + value.toString(16) + "");
    }

    /**
     * Returns the string version of a WebGL argument.
     * Attempts to convert enum arguments to strings.
     * @param {string} functionName the name of the WebGL function.
     * @param {number} numArgs the number of arguments passed to the function.
     * @param {number} argumentIndx the index of the argument.
     * @param {*} value The value of the argument.
     * @return {string} The value as a string.
     */
    export function glFunctionArgToString(functionName: string, numArgs: number, argumentIndex: number, value: any): string {
        var funcInfo = (glValidEnumContexts as any)[functionName];
        if (funcInfo !== undefined) {
            var funcInfo = funcInfo[numArgs];
            if (funcInfo !== undefined) {
                if (funcInfo[argumentIndex]) {
                    if (typeof funcInfo[argumentIndex] === 'object' &&
                        funcInfo[argumentIndex]['enumBitwiseOr'] !== undefined) {
                        var enums = funcInfo[argumentIndex]['enumBitwiseOr'];
                        var orResult = 0;
                        var orEnums = [];
                        for (var i = 0; i < enums.length; ++i) {
                            var enumValue = enumStringToValue[enums[i]];
                            if ((value & enumValue) !== 0) {
                                orResult |= enumValue;
                                orEnums.push(glEnumToString(enumValue));
                            }
                        }
                        if (orResult === value) {
                            return orEnums.join(' | ');
                        } else {
                            return glEnumToString(value);
                        }
                    } else {
                        return glEnumToString(value);
                    }
                }
            }
        }
        if (value === null) {
            return "null";
        } else if (value === undefined) {
            return "undefined";
        } else {
            return value.toString();
        }
    }

    /**
     * Converts the arguments of a WebGL function to a string.
     * Attempts to convert enum arguments to strings.
     *
     * @param {string} functionName the name of the WebGL function.
     * @param {any} args The arguments.
     * @return {string} The arguments as a string.
     */
    export function glFunctionArgsToString(functionName: string, args: any): string {
        // apparently we can't do args.join(",");
        var argStr = "";
        var numArgs = args.length;
        for (var ii = 0; ii < numArgs; ++ii) {
            argStr += ((ii == 0) ? '' : ', ') +
                glFunctionArgToString(functionName, numArgs, ii, args[ii]);
        }
        return argStr;
    };


    function makePropertyWrapper(wrapper: any, original: any, propertyName: string): void {
        //log("wrap prop: " + propertyName);
        wrapper.__defineGetter__(propertyName, function () {
            return original[propertyName];
        });
        // TODO(gmane): this needs to handle properties that take more than
        // one value?
        wrapper.__defineSetter__(propertyName, function (value: any) {
            //log("set: " + propertyName);
            original[propertyName] = value;
        });
    }

    // Makes a function that calls a function on another object.
    function makeFunctionWrapper(original: any, functionName: string): any {
        //log("wrap fn: " + functionName);
        var f = original[functionName];
        return function () {
            //log("call: " + functionName);
            var result = f.apply(original, arguments);
            return result;
        };
    }

    /*
function reportJSError(url: string, lineNo: any, colNo: any, msg: string) {
    try {
      const {origUrl, actualLineNo} = window.parent.getActualLineNumberAndMoveTo(url, lineNo, colNo);
      url = origUrl;
      lineNo = actualLineNo;
    } catch (ex) {
      origConsole.error(ex);
    }
    console.error(url, "line:", lineNo, ":", msg);  // eslint-disable-line
  }
  */

    function getBrowser() {
        const userAgent = navigator.userAgent;
        let m = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(m[1])) {
            m = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
            return {
                name: 'IE',
                version: m[1],
            };
        }
        if (m[1] === 'Chrome') {
            const temp = userAgent.match(/\b(OPR|Edge)\/(\d+)/);
            if (temp) {
                return {
                    name: temp[1].replace('OPR', 'Opera'),
                    version: temp[2],
                };
            }
        }
        m = m[2] ? [m[1], m[2]] : [navigator.appName, navigator.appVersion, '-?'];
        const version = userAgent.match(/version\/(\d+)/i);
        if (version) {
            m.splice(1, 1, version[1]);
        }
        return {
            name: m[0],
            version: m[1],
        };
    }

    /**
         * @typedef {Object} StackInfo
         * @property {string} url Url of line
         * @property {number} lineNo line number of error
         * @property {number} colNo column number of error
         * @property {string} [funcName] name of function
         */

    /**
     * @parameter {string} stack A stack string as in `(new Error()).stack`
     * @returns {StackInfo}
     */
    function parseStack(stack?: string) {
        const browser = getBrowser();
        let lineNdx!: number;
        let matcher!: (line: string) => any;
        if ((/chrome|opera/i).test(browser.name)) {
            lineNdx = 3;
            matcher = function (line: string) {
                const m = /at ([^(]+)*\(*(.*?):(\d+):(\d+)/.exec(line);
                if (m) {
                    let userFnName = m[1];
                    let url = m[2];
                    const lineNo = parseInt(m[3]);
                    const colNo = parseInt(m[4]);
                    if (url === '') {
                        url = userFnName;
                        userFnName = '';
                    }
                    return {
                        url: url,
                        lineNo: lineNo,
                        colNo: colNo,
                        funcName: userFnName,
                    };
                }
                return undefined;
            };
        } else if ((/firefox|safari/i).test(browser.name)) {
            lineNdx = 2;
            matcher = function (line: string) {
                const m = /@(.*?):(\d+):(\d+)/.exec(line);
                if (m) {
                    const url = m[1];
                    const lineNo = parseInt(m[2]);
                    const colNo = parseInt(m[3]);
                    return {
                        url: url,
                        lineNo: lineNo,
                        colNo: colNo,
                    };
                }
                return undefined;
            };
        }

        if (matcher && stack) {
            try {
                const lines = stack.split('\n');
                // window.fooLines = lines;
                // lines.forEach(function(line, ndx) {
                //   origConsole.log("#", ndx, line);
                // });
                return matcher(lines[lineNdx]);
            } catch (e) {
                // do nothing
            }
        }
        return undefined;
    };

    /**
     * Given a WebGL context returns a wrapped context that calls
     * gl.getError after every command and calls a function if the
     * result is not gl.NO_ERROR.
     *
     * @param {!WebGL2RenderingContext} ctx The webgl context to
     *        wrap.
     * @param {!function(err, funcName, args): void} opt_onErrorFunc
     *        The function to call when gl.getError returns an
     *        error. If not specified the default function calls
     *        console.log with a message.
     * @param {!function(funcName, args): void} opt_onFunc The
     *        function to call when each webgl function is called.
     *        You can use this to log all calls for example.
     * @param {!WebGL2RenderingContext} opt_err_ctx The webgl context
     *        to call getError on if different than ctx.
     */
    export function makeDebugContext(ctx: WebGL2RenderingContext,
        opt_onErrorFunc?: (err: GLenum, funcName: string, args: any) => void,
        opt_onFunc?: (funcName: string, args: any) => void,
        opt_err_ctx?: WebGL2RenderingContext) {
        opt_err_ctx = opt_err_ctx || ctx;
        init(ctx);
        opt_onErrorFunc = opt_onErrorFunc || function (err, functionName, args) {
            // apparently we can't do args.join(",");
            var argStr = "";
            var numArgs = args.length;
            for (var ii = 0; ii < numArgs; ++ii) {
                argStr += ((ii == 0) ? '' : ', ') +
                    glFunctionArgToString(functionName, numArgs, ii, args[ii]);
            }
            // const errorInfo = parseStack((new Error()).stack);
            error("WebGL error " + glEnumToString(err) + " in " + functionName +
                "(" + argStr + ")");
        };

        // Holds booleans for each GL error so after we get the error ourselves
        // we can still return it to the client app.
        var glErrorShadow: any = {};

        // Makes a function that calls a WebGL function and then calls getError.
        function makeErrorWrapper(ctx: WebGL2RenderingContext, functionName: string) {
            return function () {
                if (opt_onFunc) {
                    opt_onFunc(functionName, arguments);
                }
                var result = (ctx as any)[functionName].apply(ctx, arguments);
                var err = opt_err_ctx!.getError();
                if (err != 0) {
                    glErrorShadow[err] = true;
                    opt_onErrorFunc!(err, functionName, arguments);
                }
                return result;
            };
        }

        // Make a an object that has a copy of every property of the WebGL context
        // but wraps all functions.
        var wrapper: any = {};
        for (var propertyName in ctx) {
            if (typeof (ctx as any)[propertyName] == 'function') {
                if (propertyName != 'getExtension') {
                    wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);
                } else {
                    var wrapped: any = makeErrorWrapper(ctx, propertyName);
                    wrapper[propertyName] = function () {
                        var result = wrapped.apply(ctx, arguments);
                        if (!result) {
                            return null;
                        }
                        return makeDebugContext(result, opt_onErrorFunc, opt_onFunc, opt_err_ctx);
                    };
                }
            } else {
                makePropertyWrapper(wrapper, ctx, propertyName);
            }
        }

        // Override the getError function with one that returns our saved results.
        wrapper.getError = function () {
            for (var err in glErrorShadow) {
                if (glErrorShadow.hasOwnProperty(err)) {
                    if (glErrorShadow[err]) {
                        glErrorShadow[err] = false;
                        return err;
                    }
                }
            }
            return ctx.NO_ERROR;
        };

        return wrapper;
    }

    export function resetToInitialState(ctx: WebGL2RenderingContext): void {
        var isWebGL2RenderingContext = !!ctx.createTransformFeedback;

        if (isWebGL2RenderingContext) {
            ctx.bindVertexArray(null);
        }

        var numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);
        var tmp = ctx.createBuffer();
        ctx.bindBuffer(ctx.ARRAY_BUFFER, tmp);
        for (var ii = 0; ii < numAttribs; ++ii) {
            ctx.disableVertexAttribArray(ii);
            ctx.vertexAttribPointer(ii, 4, ctx.FLOAT, false, 0, 0);
            ctx.vertexAttrib1f(ii, 0);
            if (isWebGL2RenderingContext) {
                ctx.vertexAttribDivisor(ii, 0);
            }
        }
        ctx.deleteBuffer(tmp);

        var numTextureUnits = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS);
        for (var ii = 0; ii < numTextureUnits; ++ii) {
            ctx.activeTexture(ctx.TEXTURE0 + ii);
            ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, null);
            ctx.bindTexture(ctx.TEXTURE_2D, null);
            if (isWebGL2RenderingContext) {
                ctx.bindTexture(ctx.TEXTURE_2D_ARRAY, null);
                ctx.bindTexture(ctx.TEXTURE_3D, null);
                ctx.bindSampler(ii, null);
            }
        }

        ctx.activeTexture(ctx.TEXTURE0);
        ctx.useProgram(null);
        ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
        ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
        ctx.disable(ctx.BLEND);
        ctx.disable(ctx.CULL_FACE);
        ctx.disable(ctx.DEPTH_TEST);
        ctx.disable(ctx.DITHER);
        ctx.disable(ctx.SCISSOR_TEST);
        ctx.blendColor(0, 0, 0, 0);
        ctx.blendEquation(ctx.FUNC_ADD);
        ctx.blendFunc(ctx.ONE, ctx.ZERO);
        ctx.clearColor(0, 0, 0, 0);
        ctx.clearDepth(1);
        ctx.clearStencil(-1);
        ctx.colorMask(true, true, true, true);
        ctx.cullFace(ctx.BACK);
        ctx.depthFunc(ctx.LESS);
        ctx.depthMask(true);
        ctx.depthRange(0, 1);
        ctx.frontFace(ctx.CCW);
        ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.DONT_CARE);
        ctx.lineWidth(1);
        ctx.pixelStorei(ctx.PACK_ALIGNMENT, 4);
        ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 4);
        ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
        ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        // TODO: Delete this IF.
        if (ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL) {
            ctx.pixelStorei(ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL, ctx.BROWSER_DEFAULT_WEBGL);
        }
        ctx.polygonOffset(0, 0);
        ctx.sampleCoverage(1, false);
        ctx.scissor(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.stencilFunc(ctx.ALWAYS, 0, 0xFFFFFFFF);
        ctx.stencilMask(0xFFFFFFFF);
        ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
        ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT);

        if (isWebGL2RenderingContext) {
            ctx.drawBuffers([ctx.BACK]);
            ctx.readBuffer(ctx.BACK);
            ctx.bindBuffer(ctx.COPY_READ_BUFFER, null);
            ctx.bindBuffer(ctx.COPY_WRITE_BUFFER, null);
            ctx.bindBuffer(ctx.PIXEL_PACK_BUFFER, null);
            ctx.bindBuffer(ctx.PIXEL_UNPACK_BUFFER, null);
            var numTransformFeedbacks = ctx.getParameter(ctx.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS);
            for (var ii = 0; ii < numTransformFeedbacks; ++ii) {
                ctx.bindBufferBase(ctx.TRANSFORM_FEEDBACK_BUFFER, ii, null);
            }
            var numUBOs = ctx.getParameter(ctx.MAX_UNIFORM_BUFFER_BINDINGS);
            for (var ii = 0; ii < numUBOs; ++ii) {
                ctx.bindBufferBase(ctx.UNIFORM_BUFFER, ii, null);
            }
            ctx.disable(ctx.RASTERIZER_DISCARD);
            ctx.pixelStorei(ctx.UNPACK_IMAGE_HEIGHT, 0);
            ctx.pixelStorei(ctx.UNPACK_SKIP_IMAGES, 0);
            ctx.pixelStorei(ctx.UNPACK_ROW_LENGTH, 0);
            ctx.pixelStorei(ctx.UNPACK_SKIP_ROWS, 0);
            ctx.pixelStorei(ctx.UNPACK_SKIP_PIXELS, 0);
            ctx.pixelStorei(ctx.PACK_ROW_LENGTH, 0);
            ctx.pixelStorei(ctx.PACK_SKIP_ROWS, 0);
            ctx.pixelStorei(ctx.PACK_SKIP_PIXELS, 0);
            ctx.hint(ctx.FRAGMENT_SHADER_DERIVATIVE_HINT, ctx.DONT_CARE);
        }

        // TODO: This should NOT be needed but Firefox fails with 'hint'
        while (ctx.getError());
    }

    export function makeLostContextSimulatingCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
        var unwrappedContext_: WebGL2RenderingContext;
        var wrappedContext_: WebGL2RenderingContext;
        var onLost_: any[] = [];
        var onRestored_: any[] = [];
        var wrappedContext_: WebGL2RenderingContext;
        var contextId_ = 1;
        var contextLost_ = false;
        var resourceId_ = 0;
        var resourceDb_: any[] = [];
        var numCallsToLoseContext_ = 0;
        var numCalls_ = 0;
        var canRestore_ = false;
        var restoreTimeout_ = 0;
        var isWebGL2RenderingContext: boolean;

        // Holds booleans for each GL error so can simulate errors.
        var glErrorShadow_: any = {};

        canvas.getContext = function (f) {
            return function () {
                var ctx = (f as any).apply(canvas, arguments);
                // Did we get a context and is it a WebGL context?
                if ((ctx instanceof WebGL2RenderingContext) || ((window as any).WebGL2RenderingContext && (ctx instanceof WebGL2RenderingContext))) {
                    if (ctx != unwrappedContext_) {
                        if (unwrappedContext_) {
                            throw "got different context"
                        }
                        isWebGL2RenderingContext = (window as any).WebGL2RenderingContext && (ctx instanceof WebGL2RenderingContext);
                        unwrappedContext_ = ctx;
                        wrappedContext_ = makeLostContextSimulatingContext(unwrappedContext_);
                    }
                    return wrappedContext_;
                }
                return ctx;
            }
        }(canvas.getContext);

        function wrapEvent(listener: any) {
            if (typeof (listener) == "function") {
                return listener;
            } else {
                return function (info: any) {
                    listener.handleEvent(info);
                }
            }
        }

        var addOnContextLostListener = function (listener: any) {
            onLost_.push(wrapEvent(listener));
        };

        var addOnContextRestoredListener = function (listener: any) {
            onRestored_.push(wrapEvent(listener));
        };


        function wrapAddEventListener(canvas: HTMLCanvasElement) {
            var f = canvas.addEventListener;
            canvas.addEventListener = function (type: string, listener: any, bubble: any) {
                switch (type) {
                    case 'webglcontextlost':
                        addOnContextLostListener(listener);
                        break;
                    case 'webglcontextrestored':
                        addOnContextRestoredListener(listener);
                        break;
                    default:
                        (f as any).apply(canvas, arguments);
                }
            };
        }

        wrapAddEventListener(canvas);

        (canvas as any).loseContext = function () {
            if (!contextLost_) {
                contextLost_ = true;
                numCallsToLoseContext_ = 0;
                ++contextId_;
                while (unwrappedContext_.getError());
                clearErrors();
                glErrorShadow_[unwrappedContext_.CONTEXT_LOST_WEBGL] = true;
                var event = makeWebGLContextEvent("context lost");
                var callbacks = onLost_.slice();
                setTimeout(function () {
                    //log("numCallbacks:" + callbacks.length);
                    for (var ii = 0; ii < callbacks.length; ++ii) {
                        //log("calling callback:" + ii);
                        callbacks[ii](event);
                    }
                    if (restoreTimeout_ >= 0) {
                        setTimeout(function () {
                            (canvas as any).restoreContext();
                        }, restoreTimeout_);
                    }
                }, 0);
            }
        };

        (canvas as any).restoreContext = function () {
            if (contextLost_) {
                if (onRestored_.length) {
                    setTimeout(function () {
                        if (!canRestore_) {
                            throw "can not restore. webglcontestlost listener did not call event.preventDefault";
                        }
                        freeResources();
                        resetToInitialState(unwrappedContext_);
                        contextLost_ = false;
                        numCalls_ = 0;
                        canRestore_ = false;
                        var callbacks = onRestored_.slice();
                        var event = makeWebGLContextEvent("context restored");
                        for (var ii = 0; ii < callbacks.length; ++ii) {
                            callbacks[ii](event);
                        }
                    }, 0);
                }
            }
        };

        (canvas as any).loseContextInNCalls = function (numCalls: number) {
            if (contextLost_) {
                throw "You can not ask a lost contet to be lost";
            }
            numCallsToLoseContext_ = numCalls_ + numCalls;
        };

        (canvas as any).getNumCalls = function () {
            return numCalls_;
        };

        (canvas as any).setRestoreTimeout = function (timeout: number) {
            restoreTimeout_ = timeout;
        };

        function isWebGLObject(obj: any) {
            //return false;
            return (obj instanceof WebGLBuffer ||
                obj instanceof WebGLFramebuffer ||
                obj instanceof WebGLProgram ||
                obj instanceof WebGLRenderbuffer ||
                obj instanceof WebGLShader ||
                obj instanceof WebGLTexture);
        }

        function checkResources(args: any) {
            for (var ii = 0; ii < args.length; ++ii) {
                var arg = args[ii];
                if (isWebGLObject(arg)) {
                    return arg.__webglDebugContextLostId__ == contextId_;
                }
            }
            return true;
        }

        function clearErrors() {
            var k = Object.keys(glErrorShadow_);
            for (var ii = 0; ii < k.length; ++ii) {
                delete glErrorShadow_[k[ii]];
            }
        }

        function loseContextIfTime() {
            ++numCalls_;
            if (!contextLost_) {
                if (numCallsToLoseContext_ == numCalls_) {
                    (canvas as any).loseContext();
                }
            }
        }

        // Makes a function that simulates WebGL when out of context.
        function makeLostContextFunctionWrapper(ctx: WebGL2RenderingContext, functionName: string) {
            var f = (ctx as any)[functionName];
            return function () {
                // log("calling:" + functionName);
                // Only call the functions if the context is not lost.
                loseContextIfTime();
                if (!contextLost_) {
                    //if (!checkResources(arguments)) {
                    //  glErrorShadow_[wrappedContext_.INVALID_OPERATION] = true;
                    //  return;
                    //}
                    var result = f.apply(ctx, arguments);
                    return result;
                }
            };
        }

        function freeResources() {
            for (var ii = 0; ii < resourceDb_.length; ++ii) {
                var resource = resourceDb_[ii];
                if (resource instanceof WebGLBuffer) {
                    unwrappedContext_.deleteBuffer(resource);
                } else if (resource instanceof WebGLFramebuffer) {
                    unwrappedContext_.deleteFramebuffer(resource);
                } else if (resource instanceof WebGLProgram) {
                    unwrappedContext_.deleteProgram(resource);
                } else if (resource instanceof WebGLRenderbuffer) {
                    unwrappedContext_.deleteRenderbuffer(resource);
                } else if (resource instanceof WebGLShader) {
                    unwrappedContext_.deleteShader(resource);
                } else if (resource instanceof WebGLTexture) {
                    unwrappedContext_.deleteTexture(resource);
                }
                else if (isWebGL2RenderingContext) {
                    if (resource instanceof WebGLQuery) {
                        unwrappedContext_.deleteQuery(resource);
                    } else if (resource instanceof WebGLSampler) {
                        unwrappedContext_.deleteSampler(resource);
                    } else if (resource instanceof WebGLSync) {
                        unwrappedContext_.deleteSync(resource);
                    } else if (resource instanceof WebGLTransformFeedback) {
                        unwrappedContext_.deleteTransformFeedback(resource);
                    } else if (resource instanceof WebGLVertexArrayObject) {
                        unwrappedContext_.deleteVertexArray(resource);
                    }
                }
            }
        }

        function makeWebGLContextEvent(statusMessage: string) {
            return {
                statusMessage: statusMessage,
                preventDefault: function () {
                    canRestore_ = true;
                }
            };
        }

        return canvas;

        function makeLostContextSimulatingContext(ctx: WebGL2RenderingContext) {
            // copy all functions and properties to wrapper
            for (var propertyName in ctx) {
                if (typeof (canvas as any)[propertyName] == 'function') {
                    (wrappedContext_ as any)[propertyName] = makeLostContextFunctionWrapper(
                        ctx, propertyName);
                } else {
                    makePropertyWrapper(wrappedContext_, ctx, propertyName);
                }
            }

            // Wrap a few functions specially.
            (wrappedContext_ as any).getError = function () {
                loseContextIfTime();
                if (!contextLost_) {
                    var err;
                    while (err = unwrappedContext_.getError()) {
                        glErrorShadow_[err] = true;
                    }
                }
                for (var e in glErrorShadow_) {
                    if (glErrorShadow_[e]) {
                        delete glErrorShadow_[e];
                        return e;
                    }
                }
                return wrappedContext_.NO_ERROR;
            };

            var creationFunctions = [
                "createBuffer",
                "createFramebuffer",
                "createProgram",
                "createRenderbuffer",
                "createShader",
                "createTexture"
            ];
            if (isWebGL2RenderingContext) {
                creationFunctions.push(
                    "createQuery",
                    "createSampler",
                    "fenceSync",
                    "createTransformFeedback",
                    "createVertexArray"
                );
            }
            for (var ii = 0; ii < creationFunctions.length; ++ii) {
                var functionName = creationFunctions[ii];
                (wrappedContext_ as any)[functionName] = function (f) {
                    return function () {
                        loseContextIfTime();
                        if (contextLost_) {
                            return null;
                        }
                        var obj = f.apply(ctx, arguments);
                        obj.__webglDebugContextLostId__ = contextId_;
                        resourceDb_.push(obj);
                        return obj;
                    };
                }((ctx as any)[functionName]);
            }

            var functionsThatShouldReturnNull = [
                "getActiveAttrib",
                "getActiveUniform",
                "getBufferParameter",
                "getContextAttributes",
                "getAttachedShaders",
                "getFramebufferAttachmentParameter",
                "getParameter",
                "getProgramParameter",
                "getProgramInfoLog",
                "getRenderbufferParameter",
                "getShaderParameter",
                "getShaderInfoLog",
                "getShaderSource",
                "getTexParameter",
                "getUniform",
                "getUniformLocation",
                "getVertexAttrib"
            ];
            if (isWebGL2RenderingContext) {
                functionsThatShouldReturnNull.push(
                    "getInternalformatParameter",
                    "getQuery",
                    "getQueryParameter",
                    "getSamplerParameter",
                    "getSyncParameter",
                    "getTransformFeedbackVarying",
                    "getIndexedParameter",
                    "getUniformIndices",
                    "getActiveUniforms",
                    "getActiveUniformBlockParameter",
                    "getActiveUniformBlockName"
                );
            }
            for (var ii = 0; ii < functionsThatShouldReturnNull.length; ++ii) {
                var functionName = functionsThatShouldReturnNull[ii];
                (wrappedContext_ as any)[functionName] = function (f) {
                    return function () {
                        loseContextIfTime();
                        if (contextLost_) {
                            return null;
                        }
                        return f.apply(ctx, arguments);
                    }
                }((wrappedContext_ as any)[functionName]);
            }

            var isFunctions = [
                "isBuffer",
                "isEnabled",
                "isFramebuffer",
                "isProgram",
                "isRenderbuffer",
                "isShader",
                "isTexture"
            ];
            if (isWebGL2RenderingContext) {
                isFunctions.push(
                    "isQuery",
                    "isSampler",
                    "isSync",
                    "isTransformFeedback",
                    "isVertexArray"
                );
            }
            for (var ii = 0; ii < isFunctions.length; ++ii) {
                var functionName = isFunctions[ii];
                (wrappedContext_ as any)[functionName] = function (f) {
                    return function () {
                        loseContextIfTime();
                        if (contextLost_) {
                            return false;
                        }
                        return f.apply(ctx, arguments);
                    }
                }((wrappedContext_ as any)[functionName]);
            }

            wrappedContext_.checkFramebufferStatus = function (f) {
                return function () {
                    loseContextIfTime();
                    if (contextLost_) {
                        return wrappedContext_.FRAMEBUFFER_UNSUPPORTED;
                    }
                    return (f as any).apply(ctx, arguments);
                };
            }(wrappedContext_.checkFramebufferStatus);

            wrappedContext_.getAttribLocation = function (f) {
                return function () {
                    loseContextIfTime();
                    if (contextLost_) {
                        return -1;
                    }
                    return (f as any).apply(ctx, arguments);
                };
            }(wrappedContext_.getAttribLocation);

            wrappedContext_.getVertexAttribOffset = function (f) {
                return function () {
                    loseContextIfTime();
                    if (contextLost_) {
                        return 0;
                    }
                    return (f as any).apply(ctx, arguments);
                };
            }(wrappedContext_.getVertexAttribOffset);

            wrappedContext_.isContextLost = function () {
                return contextLost_;
            };

            if (isWebGL2RenderingContext) {
                wrappedContext_.getFragDataLocation = function (f) {
                    return function () {
                        loseContextIfTime();
                        if (contextLost_) {
                            return -1;
                        }
                        return (f as any).apply(ctx, arguments);
                    };
                }(wrappedContext_.getFragDataLocation);

                wrappedContext_.clientWaitSync = function (f) {
                    return function () {
                        loseContextIfTime();
                        if (contextLost_) {
                            return wrappedContext_.WAIT_FAILED;
                        }
                        return (f as any).apply(ctx, arguments);
                    };
                }(wrappedContext_.clientWaitSync);

                wrappedContext_.getUniformBlockIndex = function (f) {
                    return function () {
                        loseContextIfTime();
                        if (contextLost_) {
                            return wrappedContext_.INVALID_INDEX;
                        }
                        return (f as any).apply(ctx, arguments);
                    };
                }(wrappedContext_.getUniformBlockIndex);
            }

            return wrappedContext_;
        }
    }
}

export const WebGLDebugUtils = {
    /**
     * Initializes this module. Safe to call more than once.
     * @param {!WebGL2RenderingContext} ctx A WebGL context. If
     *    you have more than one context it doesn't matter which one
     *    you pass in, it is only used to pull out constants.
     */
    init: internal.init,
    /**
     * Returns true or false if value matches any WebGL enum
     * @param {*} value Value to check if it might be an enum.
     * @return {boolean} True if value matches one of the WebGL defined enums
     */
    mightBeEnum: internal.mightBeEnum,
    /**
     * Gets an string version of an WebGL enum.
     *
     * Example:
     *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
     *
     * @param {number} value Value to return an enum for
     * @return {string} The string version of the enum.
     */
    glEnumToString: internal.glEnumToString,
    /**
     * Returns the string version of a WebGL argument.
     * Attempts to convert enum arguments to strings.
     * @param {string} functionName the name of the WebGL function.
     * @param {number} numArgs the number of arguments passed to the function.
     * @param {number} argumentIndx the index of the argument.
     * @param {*} value The value of the argument.
     * @return {string} The value as a string.
     */
    glFunctionArgToString: internal.glFunctionArgToString,
    /**
     * Converts the arguments of a WebGL function to a string.
     * Attempts to convert enum arguments to strings.
     *
     * @param {string} functionName the name of the WebGL function.
     * @param {any} args The arguments.
     * @return {string} The arguments as a string.
     */
    glFunctionArgsToString: internal.glFunctionArgsToString,
    /**
     * Given a WebGL context returns a wrapped context that calls
     * gl.getError after every command and calls a function if the
     * result is not gl.NO_ERROR.
     *
     * @param {!WebGL2RenderingContext} ctx The webgl context to
     *        wrap.
     * @param {!function(err, funcName, args): void} opt_onErrorFunc
     *        The function to call when gl.getError returns an
     *        error. If not specified the default function calls
     *        console.log with a message.
     * @param {!function(funcName, args): void} opt_onFunc The
     *        function to call when each webgl function is called.
     *        You can use this to log all calls for example.
     * @param {!WebGL2RenderingContext} opt_err_ctx The webgl context
     *        to call getError on if different than ctx.
     */
    makeDebugContext: internal.makeDebugContext,
    resetToInitialState: internal.resetToInitialState,
    makeLostContextSimulatingCanvas: internal.makeLostContextSimulatingCanvas,
};