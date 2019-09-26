import { SceneNode } from "./sceneNode";
import { EventManager } from "../events/eventManager";
import { Event, EVENTS } from '../events/event';
import { IEventHandler } from "../events/iEventHandler";
import { Scene2D } from "./scene";
// import { PhysicsManager } from "../physics/physicsManager";
import { Renderer2D } from '../graphics/renderer2d'
import { Vec2, Mat } from "../maths";
import { TimeStep } from "../utils/timestep";
import { ShaderManager } from "../gl/shaders/shaderManager";

export class SpriteNode extends SceneNode implements IEventHandler {
    protected _activeAnimation: string | undefined;
    protected _animation: boolean = false;
    protected _reverse: boolean = false;

    constructor(objectId: number, name: string,
        position: Vec2,
        depth: number,
        scale: Vec2 = Vec2.One,
        rotation: number = 0) {
        super(objectId, name, position, depth, scale, rotation);
    }

    public initialize(scene: Scene2D): void {
        if (this._material) {
            this._material.initialize();
            let m = Mat.Orthographic(0, 1200, 600, 0, -100.0, 100.0);
            this._material.shader.bind()
                .setUniformMatrix4fv('u_projection',
                scene.camera.projectionMatrix
            );
            console.log('projection matrix', scene.camera.projectionMatrix);
            
            if (this._animation) {

            }

        }

        // if (PhysicsManager.find(this._objectId)) {
        //     EventManager.subscribe(EVENTS.ACTOR_MOVED, this);
        // }

        super.initialize(scene);
    }

    public update(scene: Scene2D, delta: TimeStep): void {
        // update animations...
        super.update(scene, delta);
    }

    public render(scene: Scene2D, renderer: Renderer2D) {
        if (this._material) {
            this._material.shader.bind();
            this._material.shader.setUniformMatrix4fv('u_model', this._model);
            this._material.shader.setUniformMatrix4fv('u_view', scene.camera.viewMatrix);
            // this._material.shader.setUniformMatrix4fv('u_view', Mat.Identity);
            this._material.preRender();

            // animation...

            // reverse ...

            renderer.renderQuad();

            // reverse ...

            // animation...

            this._material.shader.unbind();

            // let sh = ShaderManager.get('shader');
            // sh.bind().setUniformMatrix4fv('u_model', this._model);
            // sh.setUniformMatrix4fv('u_projection',
            //     Mat.Identity
            // );
            // sh.setUniformMatrix4fv('u_view', Mat.Identity);// scene.camera.viewMatrix);
            // renderer.renderQuad();
            // sh.unbind();
        }
    }

    public destroy() {
        EventManager.removeSubscription(EVENTS.ACTOR_MOVED, this);
    }

    public onEvent(event: Event): void {
        // TODO
    }

}