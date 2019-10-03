import { ICameraInput } from "../cameraInputManager";
import { Camera } from "../camera";
import { IScene } from "src/core/scene/scene";
import { IEngine } from "src/core/application/engine";
import { Nullable, int } from "src/core/utils/types";
import { PointerTouch, PointerInfo, PointerEventType } from "src/core/events/pointerEvent";
import { Observer } from "src/core/utils/observable";

export abstract class BaseCameraPointerInput implements ICameraInput<Camera> {
    public abstract camera: Camera;

    private pointA!: Nullable<PointerTouch>;
    private pointB!: Nullable<PointerTouch>;

    protected _scene!: IScene;
    protected _engine!: IEngine;

    protected _altKey!: boolean;
    protected _ctrlKey!: boolean;
    protected _metaKey!: boolean;
    protected _shiftKey!: boolean;

    protected _buttonsPressed!: int;

    public buttons = [0, 1, 2];

    private _pointerObserver: Nullable<Observer<PointerInfo>> = null;

    public attachControl(preventDefault: boolean = true): void {
        this._scene = this.camera.scene;
        this._engine = this._scene.engine;

        let previousPinchSquareDistance = 0;

        this.pointA = null;
        this.pointB = null;

        this._altKey = false;
        this._ctrlKey = false;
        this._metaKey = false;
        this._shiftKey = false;

        this._buttonsPressed = 0;

        this._pointerObserver = this._engine.window.pointerObservable.add((info: PointerInfo) => {
            const evt = <PointerEvent>info.event;
            const isTouch = evt.pointerType === "touch";

            if (info.type !== PointerEventType.POINTERMOVE && this.buttons.indexOf(evt.button) === -1)
                return;

            let srcElement = <HTMLElement>(evt.srcElement || evt.target);

            this._altKey = evt.altKey;
            this._ctrlKey = evt.ctrlKey;
            this._metaKey = evt.metaKey;
            this._shiftKey = evt.shiftKey;
            this._buttonsPressed = evt.buttons;

            if (false /* pointerLock */) {

            }
            else if (info.type === PointerEventType.POINTERDOWN && srcElement) {
                try {
                    srcElement.setPointerCapture(evt.pointerId);
                }
                catch (e) {}

                if (this.pointA === null) {
                    this.pointA = {
                        x: evt.clientX,
                        y: evt.clientY,
                        pointerId: evt.pointerId,
                        type: evt.pointerType,
                    };
                }
                else if (this.pointB === null) {
                    this.pointB = {
                        x: evt.clientX,
                        y: evt.clientY,
                        pointerId: evt.pointerId,
                        type: evt.pointerType,
                    };
                }

                this._onButtonDown(evt);

                if (preventDefault && evt.preventDefault)
                    evt.preventDefault();
            }
            else if (info.type === PointerEventType.POINTERUP && srcElement) {
                try {
                    srcElement.releasePointerCapture(evt.pointerId);
                }
                catch (e) {}

                if (!isTouch)
                    this.pointB = null;

                if (this.pointB && this.pointA && this.pointA.pointerId === evt.pointerId) {
                    this.pointA = this.pointB;
                    this.pointB = null;
                }
                else if (this.pointA && this.pointB && this.pointB.pointerId === evt.pointerId) {
                    this.pointB = null;
                }
                else {
                    this.pointA = this.pointB = null;
                }

                this._onButtonUp(evt);

                if (preventDefault && evt.preventDefault)
                    evt.preventDefault();
            }
            else if (info.type === PointerEventType.POINTERMOVE) {
                if (preventDefault && evt.preventDefault)
                    evt.preventDefault();

                if (this.pointA && this.pointB === null) {
                    const offsetX = evt.clientX - this.pointA.x;
                    const offsetY = evt.clientY - this.pointA.y;

                    this._onTouch(this.pointA, offsetX, offsetY);

                    this.pointA.x = evt.clientX;
                    this.pointA.y = evt.clientY;
                }
                else if (this.pointA && this.pointB) {

                }
            }
            else if (info.type === PointerEventType.POINTERDOUBLETAP) {
                this._onDoubleTap(evt.pointerType);
            }

        }, PointerEventType.POINTERUP | PointerEventType.POINTERDOWN | PointerEventType.POINTERMOVE);

        this._engine.window.canvas.addEventListener('contextmenu', <EventListener>this._onContextMenu.bind(this), false);

    }

    public getName(): string {
        return 'pointers';
    }

    protected _onTouch(point: Nullable<PointerTouch>, offsetX: number, offsetY: number) {}

    protected _onButtonDown(evt: PointerEvent): void {}

    protected _onButtonUp(evt: PointerEvent): void {}

    protected _onDoubleTap(type: string) {}

    protected _onContextMenu(evt: PointerEvent): void {
        evt.preventDefault();
    }
}