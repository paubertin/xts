import { BaseCameraPointerInput } from "./baseCameraPointer";
import { ArcRotateCamera } from "../arcRotateCamera";
import { float, Nullable } from "src/core/utils/types";
import { PointerTouch } from "src/core/events/pointerEvent";

export class ArcRotateCameraPointerInput extends BaseCameraPointerInput {
    public camera!: ArcRotateCamera;

    private _angularSensibilityX: float = 2000.0;
    private _angularSensibilityY: float = 2000.0;

    private _pinchPrecision: float = 12.0;
    private _pinchDeltaPercentage: float = 0.0;

    private _panningSensibility: float = 5000.0;

    private _isPanClick: boolean = false;

    protected _onTouch(point: Nullable<PointerTouch>, offsetX: number, offsetY: number) {
        if (this._panningSensibility !== 0 &&
            (this._ctrlKey || this._isPanClick)) {
            this.camera.inertialPanningX -= offsetX / this._panningSensibility;
            this.camera.inertialPanningY += offsetY / this._panningSensibility;
        }
        else {
            this.camera.inertialAlphaOffset += offsetX / this._angularSensibilityX;
            this.camera.inertialBetaOffset -= offsetY / this._angularSensibilityY;
        }
    }

    protected _onButtonDown(evt: PointerEvent): void {
        this._isPanClick = evt.button === this.camera.panningMouseButton;
    }

    protected _onButtonUp(evt: PointerEvent): void {}

    protected _onDoubleTap(type: string): void {
        this.camera.restoreState();
    }
}