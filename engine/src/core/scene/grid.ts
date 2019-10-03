import { Geometry } from "../geometry";
import { WebGLContext } from "../gl/webglContext";
import { int, float } from "../utils/types";
import { Material } from "./material";
import { Shader } from "../gl/shaders/shader";
import { SceneNode } from "./sceneNode";
import { IScene } from "./scene";
import { GeometryComponent, TransformComponent } from "./component";
import { ShaderManager } from "../gl/shaders/shaderManager";
import { DrawMode, DrawModeToGL } from "../graphics/renderer";
import { gl } from "../gl";
import { Event, EVENTS } from "../events/event";

export interface GridOptions {
    size: int;
    step: int;
    axis?: boolean;
}

class GridMaterial extends Material {
    constructor(name: string, shader: Shader) {
        super(name, shader);
        this.bind();
        const loc = this._shader.context.gl.getUniformLocation(this._shader.handle!, 'uColor');
        this._shader.context.gl.uniform3fv(loc, new Float32Array([
            0.5, 0.5, 0.5,
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ]));
        this.unbind();
    }

    public bind(): void {
        this._shader.bind();
    }

    public unbind(): void {
        this._shader.unbind();
    }

    public onEvent(event: Event): void {
        if (event.code === EVENTS.SHADER_LOADED + this._shader.name) {
            this.bind();
            const loc = this._shader.context.gl.getUniformLocation(this._shader.handle!, 'uColor');
            this._shader.context.gl.uniform3fv(loc, new Float32Array([
                0.5, 0.5, 0.5,
                1, 0, 0,
                0, 1, 0,
                0, 0, 1,
            ]));
            this.unbind();
        }
    }
}

class GridGeometry extends Geometry {
    protected _size: float;
    protected _division: float;

    protected _vertices: float[] = [];

    constructor(context: WebGLContext, options: GridOptions) {
        super(context, name);

        this._size = options.size;
        this._division = this._size / options.step;

        let p: float;
        const half = this._size * 0.5;
        for (let i = 0; i <= this._division; ++i) {
            p = -half + (i * options.step);
            if (options.axis && p === 0) continue;
            this._vertices.push(p, 0, half, 0);
            this._vertices.push(p, 0, -half, 0);

            p = -p;
            this._vertices.push(-half, 0, p, 0);
            this._vertices.push(half, 0, p, 0);
        }

        if (options.axis) {
            this._vertices.push(-half - 1);   //x1
            this._vertices.push(0);	    //y1
            this._vertices.push(0);	    //z1
            this._vertices.push(1);	    //c2
            this._vertices.push(half + 1);    //x2
            this._vertices.push(0);	    //y2
            this._vertices.push(0);	    //z2
            this._vertices.push(1);	    //c2
            this._vertices.push(0);      //x1
            this._vertices.push(-half - 1);   //y1
            this._vertices.push(0);	    //z1
            this._vertices.push(2);	    //c2
            this._vertices.push(0);	    //x2
            this._vertices.push(half + 1);    //y2
            this._vertices.push(0);	    //z2
            this._vertices.push(2);	    //c2
            this._vertices.push(0);	    //x1
            this._vertices.push(0);	    //y1
            this._vertices.push(-half - 1);   //z1
            this._vertices.push(3);	    //c2
            this._vertices.push(0);	    //x2
            this._vertices.push(0);	    //y2
            this._vertices.push(half + 1);    //z2
            this._vertices.push(3);	    //c2
        }
    }

    protected _initialize(): boolean {
        const gl = this.context.gl;
        this._VAO.bind();
        this._VBO.bind();
        this._VBO.pushData(new Float32Array(this._vertices), gl.STATIC_DRAW);
        this._VBO.enableAttrib(0, 4, gl.FLOAT, false, 0, 0);
        // this._VBO.enableAttrib(4, 1, gl.FLOAT, false, 8 * 4, 3 * 8);

        this._VAO.unbind();
        this._VBO.unbind();
        return true;
    }

    public render(): void {
        const gl = this.context.gl;
        gl.drawArrays(gl.LINES, 0, this._vertices.length / 4);
    }

}


export class Grid extends SceneNode {
    constructor(scene: IScene, options: GridOptions) {
        super('grid', scene);

        const geometryComponent = new GeometryComponent();
        const grid = new GridGeometry(scene.context, options);
        grid.initialize();
        geometryComponent.geometry = grid;
        geometryComponent.material = new GridMaterial(name, ShaderManager.load('internal/gridshader'));
        this.addComponent(geometryComponent);
        this.addComponent(new TransformComponent());
    }

    public onRender(): void {

        this.getComponents('geometry').forEach((component) => {
            const geometryComponent = component as GeometryComponent;
            const material = geometryComponent.material;
            const geometry = geometryComponent.geometry;

            if (!material.shader.loaded) return;

            geometry.bind();
            material.bind();

            const camera = this._scene.camera;

            material.shader.setUniformMatrix4fv('model', this.getWorldMatrix());
            material.shader.setUniformMatrix4fv('view', camera.getViewMatrix());
            material.shader.setUniformMatrix4fv('projection', camera.getProjectionMatrix());

            geometry.render();

            material.unbind();
            geometry.unbind();
        });

        this._children.forEach((child) => child.onRender());
    }
}