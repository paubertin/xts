import { IGame, Application, AGame } from "src/core/application/application";
import { TimeStep } from "src/core/utils/timestep";
import { Logger } from "src/core/utils/log";
import { ShaderManager } from "src/core/gl/shaders/shaderManager";

import { default as shader } from './shader.glsl';
import { default as skyBoxShader } from './skybox.glsl';
import { default as cubeShader } from './cube.glsl';
import { default as sphereShader } from './sphere.glsl';
import { Shader } from "src/core/gl/shaders/shader";
import { setupConsole } from "../utils";
import { TextureManager } from "src/core/graphics/textureManager";
import { Texture2D, TextureCube, Texture } from "src/core/graphics/texture";
import { Engine } from "src/core/application/engine";
import { Mat, Vec3, Maths, toRad } from "src/core/maths";
import { InputManager } from "src/core/input/inputManager";
import { Key } from "src/core/input/keyboard";
import { IScene, Scene } from "src/core/scene/scene";
import { ArcRotateCamera } from "src/core/cameras/arcRotateCamera";
import { SceneNode } from "src/core/scene/sceneNode";
import { SkyBox } from "src/core/scene/skybox";
import { Camera } from "src/core/cameras/camera";
import { CubeGeometry } from "src/core/scene/cubeGeometry";
import { GeometryComponent, TransformComponent } from "src/core/scene/component";
import { Material } from "src/core/scene/material";
import { Cube } from "./cube";
import { Grid } from "src/core/scene/grid";
import { SphereGeometry } from "src/core/scene/sphereGeometry";
import { Event, EVENTS } from "src/core/events/event";


class CubeMaterial extends Material {
    private _texture: Texture;
    constructor(name: string, shader: Shader, texture: Texture) {
        super(name, shader);
        this._texture = texture;
    }

    public bind(): void {
        this.shader.bind();
        this._texture.bind();
    }

    public unbind(): void {
        this._texture.unbind();
        this.shader.unbind();
    }

    public onEvent(event: Event): void {
        if (event.code ===  EVENTS.SHADER_LOADED + this._shader.name) {
            this.shader.setUniform1i('texture0', 0);
        }
    }
}

class SphereMaterial extends Material {
    constructor(name: string, shader: Shader) {
        super(name, shader);
    }

    public bind(): void {
        this.shader.bind();
    }

    public unbind(): void {
        this.shader.unbind();
    }

    public onEvent(event: Event): void {
        if (event.code ===  EVENTS.SHADER_LOADED + this._shader.name) {
        }
    }
}

export class Game extends AGame {
    public skyBoxShader!: Shader;

    public skyBoxVAO!: WebGLVertexArrayObject;
    public skyBoxVBO!: WebGLBuffer;

    public cubeMapTexture!: TextureCube;

    public scene!: IScene;
    public camera!: ArcRotateCamera;

    constructor() {
        super();
    }

    public onInit(): void {
        // setupConsole();
        Logger.warn('Hello Textures');

        this.scene = new Scene(this.engine);

        this.camera = new ArcRotateCamera('myCam', 0, 0, 3.0, Vec3.Zeros, this.scene);
        this.camera.mode = Camera.PERSPECTIVE;

        this.setSkyBox();

        this.camera.setPosition(new Vec3(0, 0, 10));
        this.camera.attachControl();
        this.camera.storeState();

        this.context.gl.enable(this.context.gl.DEPTH_TEST);

        let shader = ShaderManager.load('assets/shaders/cube.glsl');
        let texture0 = TextureManager.get('assets/textures/awesomeface.png');
        let texture1 = TextureManager.get('assets/textures/wood_container.jpg');

        let cubeComponent = new GeometryComponent();
        let cube = new CubeGeometry(this.context, 'cube');
        cube.initialize();
        cubeComponent.geometry = cube;

        cubeComponent.material = new CubeMaterial('cube', shader, texture0);

        let cubeNode = new SceneNode('cube', this.scene);
        cubeNode.addComponent(cubeComponent);
        cubeNode.addComponent(new TransformComponent(new Vec3(0, 0, 0)));

        let otherCube = new SceneNode('otherCube', this.scene, cubeNode);
        let otherCubeComponent = new GeometryComponent();
        let geom = new CubeGeometry(this.context, 'cube');
        geom.initialize();
        otherCubeComponent.geometry = geom;
        otherCubeComponent.material = new CubeMaterial('cube', shader, texture1);

        otherCube.addComponent(otherCubeComponent);
        otherCube.addComponent(new TransformComponent(new Vec3(1, 1.5, -5)));

        let grid = new Grid(this.scene, { size: 20, step: 1, axis: true });

        let spShader = ShaderManager.load('assets/shaders/sphere.glsl');
        let sphereComponent = new GeometryComponent();
        let sphereGeometry = new SphereGeometry(this.context, 'sphere', 64, 64);
        sphereGeometry.initialize();
        sphereComponent.geometry = sphereGeometry;
        sphereComponent.material = new SphereMaterial('sphere', spShader);

        let sphere = new SceneNode('sphere', this.scene);
        sphere.addComponent(sphereComponent);
        sphere.addComponent(new TransformComponent(new Vec3(0, 2, 0)));
    }

    public setSkyBox() {
        let skybox = new SkyBox('skybox', this.scene, {
            shader: ShaderManager.load('assets/shaders/skybox.glsl'),
            ext: 'jpg',
            textures: [
                'assets/skybox/ocean',
            ],
        });
        /*
        const gl = this.context.gl;
        this.skyBoxShader = ShaderManager.load(skyBoxShader, 'skybox');

        this.skyBoxShader.bind();
        this.cubeMapTexture = <TextureCube>TextureManager.create('assets/skybox/desert', 'Cube', 'jpg');
        // this.cubeMapTexture = TextureManager.getCube('assets/skybox/water');
        this.skyBoxShader.setUniform1i('skybox', 0);

        this.skyBoxVAO = gl.createVertexArray()!;
        this.skyBoxVBO = gl.createBuffer()!;

        gl.bindVertexArray(this.skyBoxVAO);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.skyBoxVBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(SkyBox.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
        */
    }

    public onUpdate(step: TimeStep): void {
        this.camera.update(step);
    }

    public onRender(): void {
        /*
        const gl = this.context.gl;
        let model = Mat.Identity;
        let view = this.camera.getViewMatrix();
        let projection = this.camera.getProjectionMatrix();

        ///////////////////////////

        gl.depthFunc(gl.LEQUAL);

        this.skyBoxShader.bind();
        this.skyBoxShader.setUniformMatrix4fv('view',  view.get3x3());
        this.skyBoxShader.setUniformMatrix4fv('projection', projection);

        gl.bindVertexArray(this.skyBoxVAO);
        this.cubeMapTexture.bind();
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        gl.bindVertexArray(null);
        gl.depthFunc(gl.LESS);
        */

        this.scene.onRender();
    }
}