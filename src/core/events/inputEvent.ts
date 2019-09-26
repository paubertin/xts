import { Key } from "../input/keyboard";
import { int, float } from "../utils/types";
import { MouseButtonType } from "../input/mouse";
import { IEngine } from "../application/engine";

export abstract class InputEvent {
    public time!: float;
    constructor(engine: IEngine, public type: string) {
        this.time = engine.timer.timeMs();
    }
    
}

export class KeyEvent extends InputEvent {
    constructor(engine: IEngine, type: string, public key: Key) {
        super(engine, type);
    }
}

export class KeyUpEvent extends KeyEvent {
    constructor(engine: IEngine, type: string, key: Key) {
        super(engine, type, key);
    }
}

export class KeyDownEvent extends KeyEvent {
    constructor(engine: IEngine, type: string, key: Key) {
        super(engine, type, key);
    }
}

export class MouseEvent extends InputEvent {
    constructor(engine: IEngine, type: string) {
        super(engine, type);
    }
}

export class MouseClickEvent extends MouseEvent {
    public button: MouseButtonType;

    constructor(engine: IEngine, type: string, button: int, public x: int, public y: int) {
        super(engine, type);
        switch (button) {
            case 0: this.button = MouseButtonType.LEFT; break;
            case 1: this.button = MouseButtonType.MIDDLE; break;
            case 2: this.button = MouseButtonType.RIGHT; break;
            default: this.button = MouseButtonType.UNKNOWN; break;
        }
    }
}

export class MouseMoveEvent extends MouseEvent {
    constructor(engine: IEngine, type: string, public x: int, public y: int) {
        super(engine, type);

    }
}

export class MouseWheelEvent extends MouseEvent {
    constructor(engine: IEngine, type: string, public deltaX: int, public deltaY: int) {
        super(engine, type);

    }
}


