import { SceneNode } from './sceneNode';
import { IScene } from './scene';
import { Shader } from '../gl/shaders/shader';
import { TextureCube } from '../graphics/texture';
import { GeometryComponent } from './component';
import { CubeGeometry } from './cubeGeometry';
import { Material } from './material';
import { TextureManager } from '../graphics/textureManager';
import { ImageExtension } from '../resources/imageLoader';
import { Event, EVENTS } from '../events/event';

export interface SkyBoxMaterialOptions {
    shader: Shader;
    textures: TextureCube[] | string[];
    ext: ImageExtension;
}

class SkyBoxMaterial extends Material {
    private _textures: TextureCube[];
    constructor(name: string, materialOptions: SkyBoxMaterialOptions) {
        super(name, materialOptions.shader);
        if (materialOptions.textures[0] instanceof TextureCube) {
            this._textures = materialOptions.textures as TextureCube[];
        }
        else {
            this._textures = [];
            for (let texString of materialOptions.textures) {
                const texture = TextureManager.create(texString as string, 'Cube', materialOptions.ext);
                this._textures.push(texture as TextureCube);
            }
        }
        
    }

    public bind(): void {
        this.shader.bind();
        this._textures.forEach((texture, idx) => {
            texture.bind(idx);
        });
    }

    public unbind(): void {
        for (let i = this._textures.length - 1; i >=0; --i)
            this._textures[i].unbind(i);
        this.shader.unbind();
    }

    public onEvent(event: Event): void {
        if (event.code ===  EVENTS.SHADER_LOADED + this._shader.name) {
            this._textures.forEach((texture, idx) => {
                this.shader.setUniform1i('texture' + idx, idx);
            });
        }
    }
}

export class SkyBox extends SceneNode {
    constructor(name: string, scene: IScene, materialOptions: SkyBoxMaterialOptions) {
        super(name, scene, undefined);

        const geometryComponent = new GeometryComponent();
        const cube = new CubeGeometry(materialOptions.shader.context, name);
        cube.initialize();
        geometryComponent.geometry = cube;
        geometryComponent.material = new SkyBoxMaterial(name, materialOptions);

        this.addComponent(geometryComponent);
    }

    public onRender(): void {
        const geometryComponent = this.getComponents('geometry')[0] as GeometryComponent;
        const material = geometryComponent.material;
        const geometry = geometryComponent.geometry;
        if (!material.shader.loaded) return;

        const gl = material.shader.context.gl;

        const oldCullFaceMode = gl.getParameter(gl.CULL_FACE_MODE);

        // gl.cullFace(gl.FRONT);

        gl.depthMask(false);

        gl.depthFunc(gl.LEQUAL);
        geometry.bind();
        material.bind();

        const camera = this._scene.camera;

        let view = camera.getViewMatrix();
        view = view.get3x3();
        // let view = camera.getViewMatrix().get3x3().invert();
        const projection = camera.getProjectionMatrix();

        material.shader.setUniformMatrix4fv('view', view);
        material.shader.setUniformMatrix4fv('projection', projection);

        geometry.render();

        material.unbind();
        geometry.unbind();

        gl.cullFace(oldCullFaceMode);
        gl.depthMask(true);
        gl.depthFunc(gl.LESS);
    }
}