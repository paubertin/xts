import { IWindow } from "../application/window";
import { KeyBoardEventType, KeyBoardInfo } from "../events/keyboardEvent";
import { PointerEventType, PointerInfo } from "../events/pointerEvent";
import { int, float, bool } from "../utils/types";
import { Vec2 } from "../maths";

export class ObservableInputManager {
    private _window: IWindow;

    private _pointerX: number = 0;
    private _pointerY: number = 0;
    private _unTranslatedPointerX!: number;
    private _unTranslatedPointerY!: number;

    // keyboard
    private _onKeyDown!: (evt: KeyboardEvent) => void;
    private _onKeyUp!: (evt: KeyboardEvent) => void;

    // pointer
    private _onPointerMove!: (evt: PointerEvent) => void;
    private _onPointerDown!: (evt: PointerEvent) => void;
    private _onPointerUp!: (evt: PointerEvent) => void;

    private _totalPointersPressed: int = 0;
    private _startingPointerPosition: Vec2 = new Vec2(0, 0);
    private _startingPointerTime: float = 0;

    constructor(window: IWindow) {
        this._window = window;
    }

    public attachControl(): void {
        const canvas = this._window.canvas;

        if (!canvas) return;

        this._onKeyDown = (evt: KeyboardEvent) => {
            const type = KeyBoardEventType.KEYDOWN;
            if (this._window.keyBoardObservable.hasObservers()) {
                this._window.keyBoardObservable.notifyObservers(new KeyBoardInfo(type, evt));
            }
        };

        this._onKeyUp = (evt: KeyboardEvent) => {
            const type = KeyBoardEventType.KEYUP;
            if (this._window.keyBoardObservable.hasObservers()) {
                this._window.keyBoardObservable.notifyObservers(new KeyBoardInfo(type, evt));
            }
        };

        window.addEventListener('keydown', this._onKeyDown, false);
        window.addEventListener('keyup', this._onKeyUp, false);

        this._onPointerMove = (evt: PointerEvent) => {
            this._updatePointerPosition(evt);

            this._processPointerMove(evt);
        };

        canvas.addEventListener('wheel', <any>this._onPointerMove, false);
        canvas.addEventListener('mousemove', <any>this._onPointerMove, false);

        this._onPointerDown = (evt: PointerEvent) => {
            this._totalPointersPressed++;
            this._updatePointerPosition(evt);

            evt.preventDefault();
            canvas.focus();

            this._startingPointerPosition.x = this._pointerX;
            this._startingPointerPosition.y = this._pointerY;
            const diff = performance.now() - this._startingPointerTime;
            this._startingPointerTime = performance.now();

            this._processPointerDown(evt, diff < 200);
        };

        canvas.addEventListener('mousedown', <any>this._onPointerDown, false);

        this._onPointerUp = (evt: PointerEvent) => {
            if (this._totalPointersPressed === 0) return;
            
            this._totalPointersPressed--;
            this._updatePointerPosition(evt);

            evt.preventDefault();
            canvas.focus();

            this._processPointerUp(evt);
        };

        canvas.addEventListener('mouseup', <any>this._onPointerUp, false);
    }

    private _updatePointerPosition(evt: PointerEvent): void {
        const canvasRect = this._window.canvas.getBoundingClientRect();

        this._pointerX = evt.clientX - canvasRect.left;
        this._pointerY = evt.clientY - canvasRect.top;

        this._unTranslatedPointerX = this._pointerX;
        this._unTranslatedPointerY = this._pointerY;
    }

    private _processPointerMove(event: PointerEvent): void {
        let type = event.type === 'wheel' ? PointerEventType.POINTERWHEEL : PointerEventType.POINTERMOVE;

        if (this._window.pointerObservable.hasObservers())
            this._window.pointerObservable.notifyObservers(new PointerInfo(type, event));
    }

    private _processPointerDown(event: PointerEvent, dbl: boolean = false): void {
        let type = dbl ? PointerEventType.POINTERDOUBLETAP : PointerEventType.POINTERDOWN;

        if (this._window.pointerObservable.hasObservers())
            this._window.pointerObservable.notifyObservers(new PointerInfo(type, event));
    }

    private _processPointerUp(event: PointerEvent): void {
        let type = PointerEventType.POINTERUP;

        if (this._window.pointerObservable.hasObservers())
            this._window.pointerObservable.notifyObservers(new PointerInfo(type, event));
    }
}