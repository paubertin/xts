import { BIT } from "../utils";

export enum PointerEventType {
    POINTERDOWN = BIT(0),
    POINTERUP = BIT(1),
    POINTERMOVE = BIT(2),
    POINTERWHEEL = BIT(3),
    POINTERPICK = BIT(4),
    POINTERTAP = BIT(5),
    POINTERDOUBLETAP = BIT(6),
}

export class PointerInfo {
    constructor(public type: PointerEventType, public event: PointerEvent | WheelEvent) {}
}

export interface PointerTouch {
    x: number;
    y: number;
    pointerId: number;
    type: any;
}