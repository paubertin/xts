import { float } from "../utils/types";

export interface IViewPortLike {
    x: float;
    y: float;
    width: float;
    height: float;
}

export interface IViewPortOwnerLike {
    viewport: IViewPortLike;
}

export class ViewPort implements IViewPortLike {
    constructor(public x: float, public y: float, public width: float, public height: float) {}
}