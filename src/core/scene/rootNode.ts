import { SceneNode } from './sceneNode';
import { Vec3, Vec2 } from "../maths";
import { Scene2D } from "./scene";
import { IRenderer2D } from '../graphics/renderer2d';

export class RootNode extends SceneNode {
    constructor() {
        super(0, 'root', Vec2.Zero, 0);
    }

    public render(scene: Scene2D, renderer: IRenderer2D): void {
        this._children.sort((a: SceneNode, b: SceneNode) => a.depth < b.depth);
        this.renderChildren(scene, renderer);
    }

}