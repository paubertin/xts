import { ICameraInput } from "../cameraInputManager";
import { ArcRotateCamera } from "../arcRotateCamera";
import { IScene } from "src/core/scene/scene";
import { IEngine } from "src/core/application/engine";
import { Nullable, float } from "src/core/utils/types";
import { Observer } from "src/core/utils/observable";
import { KeyBoardInfo, KeyBoardEventType } from "src/core/events/keyboardEvent";
import { Key, Keyboard } from "src/core/input/keyboard";

export class ArcRotateCameraKeyboardInput implements ICameraInput<ArcRotateCamera> {
    public camera!: ArcRotateCamera;

    private _scene!: IScene;
    private _engine!: IEngine;

    private _keysUp: Array<Key> = [ Key.UP ];
    private _keysDown: Array<Key> = [ Key.DOWN ];
    private _keysLeft: Array<Key> = [ Key.LEFT ];
    private _keysRight: Array<Key> = [ Key.RIGHT ];

    private _keys: Array<Key> = [];

    private _ctrlPressed: boolean = false;
    private _altPressed: boolean = false;

    private _angularSpeed: float = 0.005;

    private _panningSensibility: float = 200.0;
    private _zoomingSensibility: float = 25.0;

    private _onKeyboardObserver: Nullable<Observer<KeyBoardInfo>> = null;

    public getName(): string {
        return 'keyboard';
    }

    public attachControl(preventDefault: boolean = true): void {
        this._scene = this.camera.scene;
        this._engine = this._scene.engine;

        this._onKeyboardObserver = this._engine.window.keyBoardObservable.add((info: KeyBoardInfo) => {
            const evt = info.event;
            if (!evt.metaKey) {
                const key = Keyboard.toKey(evt.keyCode);
                if (info.type === KeyBoardEventType.KEYDOWN) {
                    this._ctrlPressed = evt.ctrlKey;
                    this._altPressed = evt.altKey;

                    if (this._keysUp.includes(key)
                        || this._keysDown.includes(key)
                        || this._keysLeft.includes(key)
                        || this._keysRight.includes(key)
                        ) {
                        if (!this._keys.includes(key))
                            this._keys.push(key);

                        if (preventDefault && evt.preventDefault)
                            evt.preventDefault();
                    }
                }
                else {
                    if (this._keysUp.includes(key)
                        || this._keysDown.includes(key)
                        || this._keysLeft.includes(key)
                        || this._keysRight.includes(key)
                        ) {
                        const idx = this._keys.indexOf(key);
                        if (idx >= 0)
                            this._keys.splice(idx, 1);

                        if (preventDefault && evt.preventDefault)
                            evt.preventDefault();
                    }
                }
            }
        });
    }

    public checkInputs(): void {
        if (this._onKeyboardObserver) {
            const camera = this.camera;

            for (let key of this._keys) {
                if (this._keysLeft.includes(key)) {
                    if (this._ctrlPressed) {
                        camera.inertialPanningX -= 1 / this._panningSensibility;
                    }
                    else {
                        camera.inertialAlphaOffset -= this._angularSpeed;
                    }
                }
                else if (this._keysRight.includes(key)) {
                    if (this._ctrlPressed) {
                        camera.inertialPanningX += 1 / this._panningSensibility;
                    }
                    else {
                        camera.inertialAlphaOffset += this._angularSpeed;
                    }
                }
                else if (this._keysDown.includes(key)) {
                    if (this._ctrlPressed) {
                        camera.inertialPanningY -= 1 / this._panningSensibility;
                    }
                    else if (this._altPressed) {
                        camera.inertialRadiusOffset -= 1 / this._zoomingSensibility;
                    }
                    else {
                        camera.inertialBetaOffset += this._angularSpeed;
                    }
                }
                else if (this._keysUp.includes(key)) {
                    if (this._ctrlPressed) {
                        camera.inertialPanningY += 1 / this._panningSensibility;
                    }
                    else if (this._altPressed) {
                        camera.inertialRadiusOffset += 1 / this._zoomingSensibility;
                    }
                    else {
                        camera.inertialBetaOffset -= this._angularSpeed;
                    }
                }
            }
        }
    }
}