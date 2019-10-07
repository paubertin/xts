import { AGame } from "src/core/application/application";
import { TimeStep } from "src/core/utils/timestep";
import { Logger } from "src/core/utils/log";
import { ShaderManager } from "src/core/gl/shaders/shaderManager";

import { Shader } from "src/core/gl/shaders/shader";
import { TextureManager } from "src/core/graphics/textureManager";
import { TextureCube, Texture } from "src/core/graphics/texture";
import { Vec3 } from "src/core/maths";
import { IScene, Scene } from "src/core/scene/scene";
import { ArcRotateCamera } from "src/core/cameras/arcRotateCamera";
import { SceneNode } from "src/core/scene/sceneNode";
import { SkyBox } from "src/core/scene/skybox";
import { Camera } from "src/core/cameras/camera";
import { CubeGeometry } from "src/core/scene/cubeGeometry";
import { GeometryComponent, TransformComponent } from "src/core/scene/component";
import { Material } from "src/core/scene/material";
import { Grid } from "src/core/scene/grid";
import { SphereGeometry } from "src/core/scene/sphereGeometry";
import { Event, EVENTS } from "src/core/events/event";
import { Hash } from "src/core/maths/hash";
import { uint32 } from "src/core/maths/uint32";
import { uint64 } from "src/core/maths/uint64";
import { AssetManager } from "src/core/resources/assetManager";


class CubeMaterial extends Material {
    private _texture: Texture;
    constructor(name: string, shader: Shader, texture: Texture) {
        super(name, shader);
        this._texture = texture;
    }

    public bind(): void {
        this.shader.bind();
        this.shader.setUniform1i('texture0', 0);
        this._texture.bind();
    }

    public unbind(): void {
        this._texture.unbind();
        this.shader.unbind();
    }

    public onEvent(event: Event): void {
        if (event.code ===  EVENTS.SHADER_LOADED + this._shader.name) {
        }
    }
}

class SphereMaterial extends Material {
    private _texture: Texture;
    constructor(name: string, shader: Shader, texture: Texture) {
        super(name, shader);
        this._texture = texture;
    }

    public bind(): void {
        this.shader.bind();
        this.shader.setUniform1i('texture0', 0);
        this._texture.bind();
    }

    public unbind(): void {
        this._texture.unbind();
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

    public otherCube!: SceneNode;

    public earth!: SceneNode;

    constructor() {
        super();
    }

    public onInit(): void {
        (window as any).Hash = Hash;
        (window as any).uint32 = uint32;
        (window as any).uint64 = uint64;
        // setupConsole();
        Logger.warn('Hello Textures');

        this.scene = new Scene(this.engine);

        this.camera = new ArcRotateCamera('myCam', 0, 0, 3.0, Vec3.Zeros, this.scene);
        this.camera.mode = Camera.PERSPECTIVE;

        this.setSkyBox();

        this.camera.setPosition(new Vec3(8, 5, 11));
        this.camera.attachControl();
        this.camera.storeState();

        this.context.gl.enable(this.context.gl.DEPTH_TEST);

        let shader = ShaderManager.load('assets/shaders/cube.glsl');
        let texture0 = TextureManager.get('assets/textures/wall.jpg');
        let texture1 = TextureManager.get('assets/textures/wood_container.jpg');
        let earthTexture = TextureManager.get('assets/textures/earth_color.jpg');

        let cubeComponent = new GeometryComponent();
        let cube = new CubeGeometry(this.context, 'cube');
        cube.initialize();
        cubeComponent.geometry = cube;

        cubeComponent.material = new CubeMaterial('cube', shader, texture0);

        let cubeNode = new SceneNode('cube', this.scene);
        cubeNode.addComponent(cubeComponent);
        cubeNode.addComponent(new TransformComponent(new Vec3(0, 0, 0)));

        this.otherCube = new SceneNode('otherCube', this.scene, cubeNode);
        let otherCubeComponent = new GeometryComponent();
        let geom = new CubeGeometry(this.context, 'cube');
        geom.initialize();
        otherCubeComponent.geometry = geom;
        otherCubeComponent.material = new CubeMaterial('cube', shader, texture1);

        this.otherCube.addComponent(otherCubeComponent);
        let t = new TransformComponent(new Vec3(1, 1.5, -5));
        t.rotateDeg(45, 'Y');
        t.rotateDeg(45, 'X');
        this.otherCube.addComponent(t);

        let grid = new Grid(this.scene, { size: 20, step: 1, axis: false });

        let spShader = ShaderManager.load('assets/shaders/sphere.glsl');
        let sphereComponent = new GeometryComponent();
        let sphereGeometry = new SphereGeometry(this.context, 'sphere', 128, 128);
        sphereGeometry.initialize();
        sphereComponent.geometry = sphereGeometry;
        sphereComponent.material = new SphereMaterial('sphere', spShader, earthTexture);

        this.earth = new SceneNode('sphere', this.scene);
        this.earth.addComponent(sphereComponent);
        this.earth.addComponent(new TransformComponent(new Vec3(0, 2, 0)));

        AssetManager.get('assets/meshes/pirate/pirate_girl.obj');
    }

    public setSkyBox() {
        let skybox = new SkyBox('skybox', this.scene, {
            shader: ShaderManager.load('assets/shaders/skybox.glsl'),
            ext: 'jpg',
            textures: [
                'assets/skybox/space2',
            ],
        });
    }

    public onUpdate(step: TimeStep): void {
        this.camera.update(step);
        this.scene.onUpdate(step);
        this.otherCube.rotate(2 *Math.PI / 15 * step.seconds, 'Y');
        this.earth.rotate(2 *Math.PI / 15 * step.seconds, 'Y');
    }

    public onRender(): void {
        this.scene.onRender();
    }
}