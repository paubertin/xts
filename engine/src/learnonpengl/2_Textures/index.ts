import { IGame, Application, AGame } from "src/core/application/application";
import { TimeStep } from "src/core/utils/timestep";
import { Logger } from "src/core/utils/log";
import { ShaderManager } from "src/core/gl/shaders/shaderManager";

import { default as shader } from './shader.glsl';
import { default as skyBoxShader } from './skybox.glsl';
import { Shader } from "src/core/gl/shaders/shader";
import { gl } from "src/core/gl";
import { setupConsole } from "../utils";
import { TextureManager } from "src/core/graphics/textureManager";
import { Texture2D } from "src/core/graphics/texture";
import { Engine } from "src/core/application/engine";
import { Mat, Vec3, Maths, toRad } from "src/core/maths";
import { InputManager } from "src/core/input/inputManager";
import { Key } from "src/core/input/keyboard";
import { IScene, Scene } from "src/core/scene/scene";
import { ArcRotateCamera } from "src/core/cameras/arcRotateCamera";
import { SceneNode } from "src/core/scene/sceneNode";
import { Camera } from "src/core/cameras/camera";

class Cube {

    public static vertices = [
        // Front face
        -1.0, -1.0,  1.0,        0.0, 0.0,
        1.0, -1.0,  1.0,         1.0, 0.0,
        1.0,  1.0,  1.0,         1.0, 1.0,
        -1.0,  1.0,  1.0,        0.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,        0.0, 0.0,
        -1.0,  1.0, -1.0,         1.0, 0.0,
        1.0,  1.0, -1.0,         1.0, 1.0,
        1.0, -1.0, -1.0,        0.0, 1.0,

        // Top face
        -1.0,  1.0, -1.0,         0.0, 0.0,
        -1.0,  1.0,  1.0,          1.0, 0.0,
        1.0,  1.0,  1.0,          1.0, 1.0,
        1.0,  1.0, -1.0,         0.0, 1.0,

        // Bottom face
        -1.0, -1.0, -1.0,        0.0, 0.0,
        1.0, -1.0, -1.0,         1.0, 0.0,
        1.0, -1.0,  1.0,         1.0, 1.0,
        -1.0, -1.0,  1.0,        0.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,        0.0, 0.0,
        1.0,  1.0, -1.0,         1.0, 0.0,
        1.0,  1.0,  1.0,         1.0, 1.0,
        1.0, -1.0,  1.0,        0.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,        0.0, 0.0,
        -1.0, -1.0,  1.0,         1.0, 0.0,
        -1.0,  1.0,  1.0,         1.0, 1.0,
        -1.0,  1.0, -1.0,        0.0, 1.0,
    ];

    public static indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];
}

export class Game extends AGame {
    public shader!: Shader;
    public skyBoxShader!: Shader;
    public VAO!: WebGLVertexArrayObject;
    public VBO!: WebGLBuffer;
    public EBO!: WebGLBuffer;

    public vertexBuffer!: WebGLBuffer;
    public textureBuffer!: WebGLBuffer;

    public texture1!: Texture2D;
    public texture2!: Texture2D;

    public scene!: IScene;
    public camera!: ArcRotateCamera;

    constructor() {
        super();
        (window as any).Vec3 = Vec3;
    }
    public onInit(): void {
        setupConsole();
        Logger.warn('Hello Textures');

        this.scene = new Scene(this.engine);

        this.camera = new ArcRotateCamera('myCam', 0, 0, 3.0, Vec3.Zeros, this.scene);
        this.camera.mode = Camera.PERSPECTIVE;

        // gl.disable(gl.CULL_FACE);

        this.shader = ShaderManager.load(shader, 'shader_test');
        this.skyBoxShader = ShaderManager.load(skyBoxShader, 'skybox');

        this.VAO = gl.createVertexArray()!;
        this.VBO = gl.createBuffer()!;
        this.EBO = gl.createBuffer()!;

        this.vertexBuffer = gl.createBuffer()!;
        this.textureBuffer = gl.createBuffer()!;

        gl.bindVertexArray(this.VAO);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cube.vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Cube.indices), gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * 4, 0);
        gl.enableVertexAttribArray(0);

        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
        gl.enableVertexAttribArray(1);

        this.shader.bind();
        this.texture1 = TextureManager.get('assets/textures/container.png');
        this.shader.setUniform1i('texture1', 0);
        this.texture2 = TextureManager.get('assets/textures/awesomeface.png');
        this.shader.setUniform1i('texture2', 1);


        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);


        this.camera.setPosition(new Vec3(5, 5, 8));
        this.camera.attachControl();
        this.camera.storeState();

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // this.engine.window.keyBoardObservable.add((info) => {
        //     console.log('infop', info);
        // });
    }

    public onUpdate(step: TimeStep): void {
        this.camera.update(step);
    }

    public onRender(): void {
        let model = Mat.Identity;

        this.shader.bind();

        this.shader.setUniformMatrix4fv('model', model);

        let view = this.camera.getViewMatrix();
        let projection = this.camera.getProjectionMatrix();

        this.shader.setUniformMatrix4fv('view', view);

        this.shader.setUniformMatrix4fv('projection', projection);

        gl.bindVertexArray(this.VAO);

        this.texture1.bind();
        this.texture2.bind(1);

        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    }
}