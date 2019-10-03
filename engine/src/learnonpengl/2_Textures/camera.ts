import { float } from "src/core/utils/types";
import { Vec3, toRad, Mat } from "src/core/maths";
import { InputManager } from "src/core/input/inputManager";
import { Key } from "src/core/input/keyboard";
import { TimeStep } from "src/core/utils/timestep";

enum CameraMovement {
    FORWARD,
    BACKWARD,
    LEFT,
    RIGHT,
}

const YAW: float = -90.0;
const PITCH: float = 0.0;
const SPEED: float = 0.5;
const SENSITIVITY: float = 0.1;
const ZOOM: float = 45.0;

export class Camera {
    public position: Vec3;
    public front: Vec3;
    public up!: Vec3;
    public right!: Vec3;
    public worldUp: Vec3;

    public yaw: float;
    public pitch: float;

    public speed: float;
    public sensitivity: float;
    public zoom: float;

    public view!: Mat;

    constructor(position: Vec3, up: Vec3 = Vec3.Y, yaw: float = YAW, pitch: float = PITCH) {
        this.front = new Vec3(0, 0, -1);
        this.speed = SPEED;
        this.sensitivity = SENSITIVITY;
        this.zoom = ZOOM;

        this.position = position.clone();
        this.worldUp = up.clone();
        this.yaw = yaw;
        this.pitch = pitch;

        this._updateVectors();
    }

    public getViewMatrix(): Mat {
        this.view = Mat.LookAt(this.position, Vec3.Add(this.position, this.front), this.up);
        return this.view;
    }

    public update(step: TimeStep): void {
        let hasMoved = false;
        if (InputManager.isKeyDown(Key.LEFT, Key.RIGHT, Key.UP, Key.DOWN)) {
            const velocity = this.speed * step.seconds;
            let toAdd: Vec3 = new Vec3(0, 0, 0);
            hasMoved = true;
            if (InputManager.isKeyDown(Key.LEFT)) {
                toAdd = toAdd.add(this.right.clone().mult(-velocity));
            }
            if (InputManager.isKeyDown(Key.RIGHT)) {
                toAdd = toAdd.add(this.right.clone().mult(velocity));
            }
            if (InputManager.isKeyDown(Key.UP)) {
                toAdd = toAdd.add(this.front.clone().mult(velocity));
            }
            if (InputManager.isKeyDown(Key.DOWN)) {
                toAdd = toAdd.add(this.front.clone().mult(-velocity));
            }
            this.position = this.position.add(toAdd);
        }

        if (InputManager.isKeyDown(Key.A)) {
            hasMoved = true;
            this.yaw += 0.5 *this.sensitivity;
        }
        if (InputManager.isKeyDown(Key.Z)) {
            hasMoved = true;
            this.yaw -= 0.5 *this.sensitivity;
        }

        if (InputManager.isKeyDown(Key.Q)) {
            hasMoved = true;
            this.pitch += 1 *this.sensitivity;
        }
        if (InputManager.isKeyDown(Key.S)) {
            hasMoved = true;
            this.pitch -= 1 *this.sensitivity;
        }

        if (hasMoved) {
            this._updateVectors();
        }
    }

    protected _updateVectors(): void {
        let front: Vec3 = new Vec3();
        front.x = Math.cos(toRad(this.yaw)) * Math.cos(toRad(this.pitch));
        front.y = Math.sin(toRad(this.pitch));
        front.z = Math.sin(toRad(this.yaw)) * Math.cos(toRad(this.pitch));
        this.front = front.normalized();
        this.right = Vec3.Cross(this.front, this.worldUp).normalized();
        this.up = Vec3.Cross(this.right, this.front).normalized();
    }

}