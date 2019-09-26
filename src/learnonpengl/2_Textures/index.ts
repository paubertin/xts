import { IGame, Application, AGame } from "src/core/application/application";
import { TimeStep } from "src/core/utils/timestep";
import { Logger } from "src/core/utils/log";
import { ShaderManager } from "src/core/gl/shaders/shaderManager";

import { default as shader } from './shader.glsl';
import { Shader } from "src/core/gl/shaders/shader";
import { gl } from "src/core/gl";
import { setupConsole } from "../utils";
import { TextureManager } from "src/core/graphics/textureManager";
import { Texture2D } from "src/core/graphics/texture";
import { Engine } from "src/core/application/engine";
import { Mat, Vec3, Maths, toRad } from "src/core/maths";
import { Camera } from "./camera";
import { InputManager } from "src/core/input/inputManager";
import { Key } from "src/core/input/keyboard";
import { setPriority } from "os";

export class Game extends AGame {
    public shader!: Shader;
    public VAO!: WebGLVertexArrayObject;
    public VBO!: WebGLBuffer;
    public EBO!: WebGLBuffer;

    public texture1!: Texture2D;
    public texture2!: Texture2D;

    public camera!: Camera;

    constructor() {
        super();
        (window as any).Vec3 = Vec3;
    }
    public onInit(): void {
        setupConsole();
        Logger.warn('Hello Textures');

        // gl.disable(gl.CULL_FACE);

        this.shader = ShaderManager.load(shader, 'shader_test');

        let vertices = [
            // positions                // colors                   // texture coords
            0.5,    0.5,    0.0,        1.0,    0.0,    0.0,        1.0,    1.0,           // top right
            0.5,    -0.5,   0.0,        0.0,    1.0,    0.0,        1.0,    0.0,           // bottom right
            -0.5,   -0.5,   0.0,        0.0,    0.0,    1.0,        0.0,    0.0,           // bottom left
            -0.5,   0.5,    0.0,        1.0,    1.0,    0.0,        0.0,    1.0,           // top left
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

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * 4, 0);
        gl.enableVertexAttribArray(0);

        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
        gl.enableVertexAttribArray(1);

        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
        gl.enableVertexAttribArray(2);

        this.shader.bind();
        this.texture1 = TextureManager.get('assets/textures/wood_container.jpg');
        this.shader.setUniform1i('texture1', 0);
        this.texture2 = TextureManager.get('assets/textures/awesomeface.png');
        this.shader.setUniform1i('texture2', 1);


        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);

        this.camera = new Camera(new Vec3(0, 0, 3));
    }

    public onUpdate(step: TimeStep): void {
        let hasMoved = false;
        if (InputManager.isKeyDown(Key.LEFT, Key.RIGHT, Key.UP, Key.DOWN)) {
            const velocity = this.camera.speed * step.seconds;
            let toAdd: Vec3 = new Vec3(0, 0, 0);
            hasMoved = true;
            if (InputManager.isKeyDown(Key.LEFT)) {
                toAdd = toAdd.add(this.camera.right.clone().mult(-velocity));
            }
            if (InputManager.isKeyDown(Key.RIGHT)) {
                toAdd = toAdd.add(this.camera.right.clone().mult(velocity));
            }
            if (InputManager.isKeyDown(Key.UP)) {
                toAdd = toAdd.add(this.camera.front.clone().mult(velocity));
            }
            if (InputManager.isKeyDown(Key.DOWN)) {
                toAdd = toAdd.add(this.camera.front.clone().mult(-velocity));
            }
            this.camera.position = this.camera.position.add(toAdd);
        }

        if (InputManager.isKeyDown(Key.A)) {
            hasMoved = true;
            this.camera.yaw += 0.5 *this.camera.sensitivity;
        }
        if (InputManager.isKeyDown(Key.Z)) {
            hasMoved = true;
            this.camera.yaw -= 0.5 *this.camera.sensitivity;
        }

        if (InputManager.isKeyDown(Key.Q)) {
            hasMoved = true;
            this.camera.pitch += 1 *this.camera.sensitivity;
        }
        if (InputManager.isKeyDown(Key.S)) {
            hasMoved = true;
            this.camera.pitch -= 1 *this.camera.sensitivity;
        }

        if (hasMoved) {
            this.camera.update();
            console.log('yaw', this.camera.yaw);
            console.log('pitch', this.camera.pitch);
        }
    }

    public onRender(): void {
        let model = Mat.Identity;
        let view = Mat.Identity;

        // model = Mat.Rotate(model, Vec3.Z, this.engine.timer.time() * 0);
        // model = Mat.Rotation(Vec3.X, - toRad(55)).multiply(model);

        let projection = Mat.Perspective(toRad(this.camera.zoom), this.engine.window.width / this.engine.window.height, 0.1, 100);

        this.shader.bind();

        this.shader.setUniformMatrix4fv('model', model);

        view = Mat.Translate(view, new Vec3(0, 0, -3));
        view = this.camera.getViewMatrix();

        this.shader.setUniformMatrix4fv('view', view);

        this.shader.setUniformMatrix4fv('projection', projection);

        this.texture1.bind();
        this.texture2.bind(1);
        // gl.activeTexture(gl.TEXTURE0);
        // gl.bindTexture(gl.TEXTURE_2D, this.texture1);
        // gl.activeTexture(gl.TEXTURE1);
        // gl.bindTexture(gl.TEXTURE_2D, this.texture2);

        gl.bindVertexArray(this.VAO);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
}