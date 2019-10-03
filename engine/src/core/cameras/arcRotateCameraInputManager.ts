import { CameraInputManager } from "./cameraInputManager";
import { ArcRotateCamera } from "./arcRotateCamera";
import { ArcRotateCameraKeyboardInput } from "./inputs/arcRotateCameraKeyboard";
import { ArcRotateCameraWheelInput } from "./inputs/arcRotateCameraWheel";
import { ArcRotateCameraPointerInput } from "./inputs/arcRotateCameraPointer";

export class ArcRotateCameraInputManager extends CameraInputManager<ArcRotateCamera> {
    constructor(camera: ArcRotateCamera) {
        super(camera);
    }

    public addKeyboard(): ArcRotateCameraInputManager {
        this.add(new ArcRotateCameraKeyboardInput());
        return this;
    }

    public addMouseWheel(): ArcRotateCameraInputManager {
        this.add(new ArcRotateCameraWheelInput());
        return this;
    }

    public addPointer(): ArcRotateCameraInputManager {
        this.add(new ArcRotateCameraPointerInput());
        return this;
    }
}