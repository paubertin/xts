import { AGame } from "src/core/application/application";
import { TimeStep } from "src/core/utils/timestep";
import { Logger } from "src/core/utils/log";
import { ShaderManager } from "src/core/gl/shaders/shaderManager";

import {default as shader} from './shader.glsl';
import { Shader } from "src/core/gl/shaders/shader";
import { gl } from "src/core/gl";
import { setupConsole } from "../utils";

export class Game extends AGame {
    public shader!: Shader;
    public VAO!: WebGLVertexArrayObject;
    public VBO!: WebGLBuffer;
    public EBO!: WebGLBuffer;

    constructor() {
        super();
    }

    public onInit(): void {
        setupConsole();
        Logger.warn('init hello Triangle');

        // gl.disable(gl.CULL_FACE);

        this.shader = ShaderManager.load(shader, 'shader_test');

        let vertices = [
            0.5,    0.5,    0.0,    // top right
            0.5,    -0.5,   0.0,    // bottom right
            -0.5,   -0.5,   0.0,    // bottom left
            -0.5,    0.5,   0.0     // top left
        ];

        let indices = [
            0, 1, 3,    // first triangle
            1, 2, 3,    // second triangle
        ];

        this.VAO = gl.createVertexArray()!;
        this.VBO = gl.createBuffer()!;
        this.EBO = gl.createBuffer()!;

        gl.bindVertexArray(this.VAO);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    public onUpdate(step: TimeStep): void {

    }

    public onRender(): void {
        this.shader.bind();
        gl.bindVertexArray(this.VAO);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
}