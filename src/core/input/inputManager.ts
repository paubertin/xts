import { Keyboard, Key } from "./keyboard";
import { InputEvent, KeyUpEvent, KeyDownEvent, MouseClickEvent, MouseMoveEvent, MouseWheelEvent } from "../events/inputEvent";
import { Nullable, bool } from "../utils/types";
import { IWindow } from "../application/window";
import { Mouse } from "./mouse";
import { IEngine } from "../application/engine";

export class InputManager {

    public static init(engine: IEngine): void {
        if (InputManager._instance) {
            throw new Error('AssetManager already instanciated');
        }
        InputManager._instance = new InputManager();
        InputManager.engine = engine;
    }

    public static attach(window: IWindow): void {
        const canvas = window.canvas;
    
    }

    public static update(time: number): void {
        InputManager.instance.keyboard.update(time);
        InputManager.instance.mouse.update(time);
    }

    public static keyWasPressed(key: Key): bool {
        return InputManager.instance.keyboard.wasPressed(key);
    }

    public static isKeyDown(...key: Key[]): bool {
        return InputManager.instance.keyboard.isKeyDown(...key);
    }

    public static mouseCallback(event: MouseEvent): void {
        let mouseEvent;
        switch (event.type) {
            case 'mousedown': {
                mouseEvent = new MouseClickEvent(InputManager.engine, 'down', event.button, event.x, event.y);
                InputManager.instance.mouse.onMouseClick(mouseEvent);
                break;
            }
            case 'mouseup': {
                mouseEvent = new MouseClickEvent(InputManager.engine, 'up', event.button, event.x, event.y);
                InputManager.instance.mouse.onMouseClick(mouseEvent);
                break;
            }
            case 'mousemove': {
                mouseEvent = new MouseMoveEvent(InputManager.engine, 'move', event.x, event.y);
                InputManager.instance.mouse.onMouseMove(mouseEvent);
                break;
            }
            case 'wheel': {
                mouseEvent = new MouseWheelEvent(InputManager.engine, 'move', (<WheelEvent>event).deltaX, (<WheelEvent>event).deltaY);
                InputManager.instance.mouse.onMouseWheel(mouseEvent);
                break;
            }
            default: break;
        }
        if (InputManager._eventCallback && mouseEvent) {
            InputManager._eventCallback(mouseEvent);
        }
    }

    public static keyboardCallback(event: KeyboardEvent): void {
        let keyEvent;
        switch (event.type) {
            case 'keyup': {
                keyEvent = new KeyUpEvent(InputManager.engine, event.type, Keyboard.toKey(event.keyCode));
                InputManager.instance.keyboard.onKeyUp(keyEvent);
                break;
            }
            case 'keydown': {
                keyEvent = new KeyDownEvent(InputManager.engine, event.type, Keyboard.toKey(event.keyCode));
                InputManager.instance.keyboard.onKeyDown(keyEvent);
                break;
            }
            default: break;
        }
        if (InputManager._eventCallback && keyEvent) {
            InputManager._eventCallback(keyEvent);
        }
    }

    public static setEventCallback(cb: (event: InputEvent) => void ): void {
        InputManager._eventCallback = cb;
    }

    /*
        Private
    */
    private static _instance: InputManager;
    private static engine: IEngine;
    private constructor() {
        this.keyboard = new Keyboard();
        this.mouse = new Mouse();
    }

    private static get instance(): InputManager {
        if (!InputManager._instance) {
            throw new Error('InputManager not instanciated');
        }
        return InputManager._instance;
    }

    private keyboard: Keyboard;
    private mouse: Mouse;
    private static _eventCallback: Nullable<(event: InputEvent) => void> = null;

}