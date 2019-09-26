import { Mat, Vec2 } from "../maths";
import { Material } from "../graphics/material";
import { Scene2D } from './scene';
import * as std from 'tstl';
import { IRenderer2D } from '../graphics/renderer2d';
import { TimeStep } from "../utils/timestep";

export interface ISceneNode {
    readonly objectId: number;
    readonly name: string;
    readonly model: Mat;
    readonly position: Vec2;
    readonly scale: Vec2;
    readonly rotation: number;
    readonly depth: number;

    readonly material: Material;

    calculateModel(): void;

    initialize(scene: Scene2D): void;

    restore(scene: Scene2D): void;

    update(scene: Scene2D, delta: TimeStep): void;

    isVisible(scene: Scene2D): boolean;

    preRender(scene: Scene2D): void;

    render(scene: Scene2D, renderer: IRenderer2D): void;

    postRender(scene: Scene2D): void;

    addChild(child: ISceneNode): void;

    removeChild(objectId: number): void;

    renderChildren(scene: Scene2D, renderer: IRenderer2D): void;

    getChildren(): std.List<ISceneNode>;
}