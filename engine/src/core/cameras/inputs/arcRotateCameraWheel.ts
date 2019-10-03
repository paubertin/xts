import { ICameraInput } from "../cameraInputManager";
import { ArcRotateCamera } from "../arcRotateCamera";
import { IScene } from "src/core/scene/scene";
import { IEngine } from "src/core/application/engine";
import { float } from "src/core/utils/types";
import { PointerInfo, PointerEventType } from "src/core/events/pointerEvent";
import { Nullable } from "src/core/utils/types";
import { Observer } from "src/core/utils/observable";
import { clamp } from "src/core/maths";

export class ArcRotateCameraWheelInput implements ICameraInput<ArcRotateCamera> {
    public camera!: ArcRotateCamera;

    private _scene!: IScene;
    private _engine!: IEngine;

    private _wheelPrecision: float = 30.0;

    private _wheelDeltaPercentage: float = 0.01;

    private _wheelObserver: Nullable<Observer<PointerInfo>> = null;

    public getName(): string {
        return 'mousewheel';
    }

    private computeDelta(event: any, radius: float): float {
        let delta = 0;
        let wheelDelta = (event.wheelDelta * 0.01 * this._wheelDeltaPercentage) * radius;
        if (event.wheelDelta > 0)
            delta = wheelDelta / (1.0 + this._wheelDeltaPercentage);
        else
            delta = wheelDelta * (1.0 + this._wheelDeltaPercentage);
        
        return delta;
    }

    public attachControl(preventDefault: boolean = true): void {
        this._scene = this.camera.scene;
        this._engine = this._scene.engine;

        this._wheelObserver = this._engine.window.pointerObservable.add((info: PointerInfo) => {
            if (info.type !== PointerEventType.POINTERWHEEL) return;

            const event = <WheelEvent>info.event;
            let delta = 0;

            const mouseWheelEvent = <any>event;
            if (mouseWheelEvent.wheelDelta) {
                if (this._wheelDeltaPercentage) {
                    delta = this.computeDelta(mouseWheelEvent, this.camera.radius);

                    if (delta > 0) {
                        let estimatedTargetRadius = this.camera.radius;
                        let targetInertia = this.camera.inertialRadiusOffset + delta;
                        for (let i = 0; i < 20 && Math.abs(targetInertia) > 0.001; ++i) {
                            estimatedTargetRadius -= targetInertia;
                            targetInertia *= this.camera.inertia;
                        }
                        estimatedTargetRadius = clamp(estimatedTargetRadius, 0, Number.MAX_VALUE);
                        delta = this.computeDelta(mouseWheelEvent, estimatedTargetRadius);
                    }
                }
                else {
                    delta = mouseWheelEvent.wheelDelta / (this._wheelPrecision * 40);
                }
            }
            else {
                let deltaValue = event.deltaY || event.detail;
                delta = -deltaValue / this._wheelPrecision;
            }

            if (delta) {
                this.camera.inertialRadiusOffset += delta;
            }

            // if (preventDefault && event.preventDefault)
            //     event.preventDefault();

        }, PointerEventType.POINTERWHEEL);
    }

}