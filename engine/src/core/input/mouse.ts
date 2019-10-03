import { int, bool, float } from "../utils/types";
import { MouseClickEvent, MouseMoveEvent, MouseWheelEvent } from "../events/inputEvent";

export enum MouseButtonType {
    UNKNOWN,
    RIGHT,
    MIDDLE,
    LEFT,
}

export class MouseButton {
    public pressed: bool = false;
    constructor() {}
}

export class Mouse {
    private _lockCursor: bool = false;
    private _position: [int, int] = [0, 0];
    private _prevPosition: [int, int] = [0, 0];
    private _wheel: [int, int] = [0, 0];
    private _prevWheel: [int, int] = [0, 0];

    private _buttons: Map<MouseButtonType, MouseButton> = new Map<MouseButtonType, MouseButton>();

    constructor() {
        this._buttons.set(MouseButtonType.LEFT, new MouseButton());
        this._buttons.set(MouseButtonType.RIGHT, new MouseButton());
        this._buttons.set(MouseButtonType.MIDDLE, new MouseButton());
    }

    public get x(): int {
        return this._position[0];
    }

    public get y(): int {
        return this._position[1];
    }

    public onMouseClick(mouseEvent: MouseClickEvent): void {
        let button = this._buttons.get(mouseEvent.button);
        if (!button) return;
        button.pressed = mouseEvent.type === 'down' ? true : false;
    }

    public onMouseMove(mouseEvent: MouseMoveEvent): void {
        this._position[0] = mouseEvent.x;
        this._position[1] = mouseEvent.y;
    }

    public onMouseWheel(mouseEvent: MouseWheelEvent): void {
        this._wheel[0] = mouseEvent.deltaX;
        this._wheel[1] = mouseEvent.deltaY;
    }

    public update(time: float): void {
        this._prevPosition = this._position;
        this._prevWheel = this._wheel;
    }
}