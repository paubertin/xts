import { TargetCamera, ITargetCameraCache, ITargetCameraState } from "./targetCamera";
import { float, Nullable, bool } from "../utils/types";
import { Vec3, Mat, Maths } from "../maths";
import { SceneNode } from "../scene/sceneNode";
import { IScene } from "../scene/scene";
import { timingSafeEqual } from "crypto";
import { ArcRotateCameraInputManager } from "./arcRotateCameraInputManager";
import { Logger } from "../utils/log";

SceneNode.AddConstructor('ArcRotateCamera', (name, scene) => {
    return () => new ArcRotateCamera(name, 0, 0, 1.0, Vec3.Zeros, scene);
});

export interface IArcRotateCameraState extends ITargetCameraState {
    alpha: float;
    beta: float;
    radius: float;
    target: Vec3;
}

export interface IArcRotateCameraCache extends ITargetCameraCache {
    _target?: Vec3;
    alpha?: float;
    beta?: float;
    radius?: float;
}

export class ArcRotateCamera extends TargetCamera {
    /**
     * Defines the rotation angle of the camera along the longitudinal axis.
     */
    public alpha: float;

    /**
     * Defines the rotation angle of the camera along the latitudinal axis.
     */
    public beta: float;

    /**
     * Defines the radius of the camera from its target point.
     */
    public radius: float;
    protected _target: Vec3;

    protected _upVector: Vec3 = Vec3.Y;

    protected _cache!: IArcRotateCameraCache;

    protected _upToYMatrix!: Mat;
    protected _YToUpMatrix!: Mat;

    protected _newPosition: Vec3 = Vec3.Zeros;

    private _computationVector: Vec3 = Vec3.Zeros;

    // -----
    protected _allowUpsideDown: boolean = true;

    protected _lowerBetaLimit: float = 0.01;
    protected _upperBetaLimit: float = Math.PI - 0.01;

    protected _lowerAlphaLimit: Nullable<float> = null;
    protected _upperAlphaLimit: Nullable<float> = null;

    protected _lowerRadiusLimit: Nullable<float> = null;
    protected _upperRadiusLimit: Nullable<float> = null;

    protected _localDirection!: Vec3;
    protected _transformedDirection!: Vec3;
    protected _panningAxis: Vec3 = new Vec3(1, 1, 0);

    protected _panningDistanceLimit: Nullable<float> = 0;
    protected _panningOriginTarget: Vec3 = Vec3.Zeros;

    protected _panningInertia: float = 0.9;

    protected _panningMouseButton!: number;

    // -----

    // -----
    public inertialAlphaOffset: float = 0;
    public inertialBetaOffset: float = 0;
    public inertialRadiusOffset: float = 0;

    public inertialPanningX: float = 0;
    public inertialPanningY: float = 0;
    // -----

    public inputs!: ArcRotateCameraInputManager;

    protected _storedState: Nullable<IArcRotateCameraState> = null;

    constructor(name: string, alpha: float, beta: float, radius: float, target: Vec3, scene: IScene) {
        super(name, Vec3.Zeros, scene);
        this._target = Vec3.Zeros;

        if (target) {
            this.setTarget(target);
        }

        this.alpha = alpha;
        this.beta = beta;
        this.radius = radius;

        this.getViewMatrix();
        /*
        inputs...
        */
       this.inputs = new ArcRotateCameraInputManager(this);
       this.inputs.addKeyboard().addMouseWheel().addPointer();
    }

    public storeState(): ArcRotateCamera {
        super.storeState();
        this._storedState!.alpha = this.alpha;
        this._storedState!.beta = this.beta;
        this._storedState!.radius = this.radius;
        this._storedState!.target = this._getTargetPosition().clone();
        return this;
    }

    protected _restoreStateValues(): boolean {
        if (!super._restoreStateValues())
            return false;

        this.setTarget(this._storedState!.target.clone());
        this.alpha = this._storedState!.alpha;
        this.beta = this._storedState!.beta;
        this.radius = this._storedState!.radius;

        this.inertialAlphaOffset = 0;
        this.inertialBetaOffset = 0;
        this.inertialRadiusOffset = 0;
        this.inertialPanningX = 0;
        this.inertialPanningY = 0;

        return true;
    }

    public attachControl(panningMouseButton: number = 2): void {
        this._panningMouseButton = panningMouseButton;
        this.inputs.attachControl();
    }

    public get panningMouseButton(): number {
        return this._panningMouseButton;
    }

    protected _checkInputs(): void {
        this.inputs.checkInputs();

        if (this.inertialAlphaOffset !== 0 || this.inertialBetaOffset !== 0 || this.inertialRadiusOffset !==0) {
            let inertialAlphaOffset = this.inertialAlphaOffset;
            if (this.beta <=0 ) inertialAlphaOffset *= -1;

            this.alpha += inertialAlphaOffset;
            this.beta += this.inertialBetaOffset;

            this.radius -= this.inertialRadiusOffset;
            this.inertialAlphaOffset *= this._inertia;
            this.inertialBetaOffset *= this._inertia;
            this.inertialRadiusOffset *= this._inertia;
            if (Math.abs(this.inertialAlphaOffset) < Maths.EPSILON)
                this.inertialAlphaOffset = 0;
            if (Math.abs(this.inertialBetaOffset) < Maths.EPSILON)
                this.inertialBetaOffset = 0;
            if (Math.abs(this.inertialRadiusOffset) < this._speed * Maths.EPSILON)
                this.inertialRadiusOffset = 0;
        }

        // panning inertia...
        if (this.inertialPanningX !== 0 || this.inertialPanningY !== 0) {
            if (!this._localDirection) {
                this._localDirection = Vec3.Zeros;
                this._transformedDirection = Vec3.Zeros;
            }

            this._localDirection.from(this.inertialPanningX, this.inertialPanningY, this.inertialPanningY);
            this._localDirection.mult(this._panningAxis);
            this._cameraTranformMatrix.invertFrom(this._viewMatrix);
            Mat.TransformNormal(this._cameraTranformMatrix, this._localDirection, this._transformedDirection);
            if (this._panningAxis.y === 0)
                this._transformedDirection.y = 0;

            if (this._panningDistanceLimit) {
                this._transformedDirection.add(this._target);
                const distSq = (Vec3.Sub(this._transformedDirection, this._panningOriginTarget)).sqNorm;
                if (distSq <= (this._panningDistanceLimit * this._panningDistanceLimit))
                    this._target.from(this._transformedDirection);
            }
            else {
                this._target.add(this._transformedDirection);
            }

            this.inertialPanningX *= this._panningInertia;
            this.inertialPanningY *= this._panningInertia;

            if (Math.abs(this.inertialPanningX) < this._speed * Maths.EPSILON)
                this.inertialPanningX = 0;
            if (Math.abs(this.inertialPanningY) < this._speed * Maths.EPSILON)
                this.inertialPanningY = 0;
        }

        this._checkLimits();

        super._checkInputs();
    }

    public get upVector(): Vec3 {
        return this._upVector;
    }

    public set upVector(vec: Vec3) {
        if (!this._upToYMatrix) {
            this._YToUpMatrix = new Mat(0);
            this._upToYMatrix = new Mat(0);
            this._upVector = Vec3.Zeros;
        }
        this._upVector.from(vec.normalized());
        this._setMatUp();
    }

    protected _setMatUp(): void {
        Mat.RotationAlign(Vec3.Y, this._upVector, this._YToUpMatrix);
        Mat.RotationAlign(this._upVector, Vec3.Y, this._upToYMatrix);
    }

    public get target(): Vec3 {
        return this._target;
    }

    public set target(newTarget: Vec3) {
        this.setTarget(newTarget);
    }

    public setTarget(target: Vec3): void {
        let currentTarget: Vec3 = this._getTargetPosition();

        if (currentTarget && currentTarget.equals(target))
            return;

        this._target = target.clone();

        this.rebuild();
    }

    public get position(): Vec3 {
        return this._position;
    }

    public set position(newPosition: Vec3) {
        this.setPosition(newPosition);
    }

    public setPosition(position: Vec3): void {
        if (this._position.equals(position)) return;

        this._position.from(position);

        this.rebuild();
    }

    public rebuild(): void {
        this._computationVector = Vec3.Sub(this._position, this._getTargetPosition());
        if (this._upVector.x !== 0 || this._upVector.y !== 1.0 || this._upVector.z !== 0) {
            Mat.TransformCoordinates(this._upToYMatrix, this._computationVector, this._computationVector);
        }
        this.radius = this._computationVector.norm;

        if (this.radius === 0)
            this.radius = 1e-6;
        
        if (this._computationVector.x === 0 && this._computationVector.z === 0)
            this.alpha = Math.PI / 2;
        else
            this.alpha = Math.acos(this._computationVector.x / Math.sqrt(Math.pow(this._computationVector.x, 2) + Math.pow(this._computationVector.z, 2)));
        
        if (this._computationVector.z < 0)
            this.alpha = 2 * Math.PI - this.alpha;

        this.beta = Math.acos(this._computationVector.y / this.radius);

        this._checkLimits();
    }

    protected _getTargetPosition(): Vec3 {
        return this._target;
    }

    protected _checkLimits(): void {
        if (this._lowerBetaLimit === null || this._lowerBetaLimit === undefined) {
            if (this._allowUpsideDown && this.beta > Math.PI) {
                this.beta = this.beta - (2 * Math.PI);
            }
        } else {
            if (this.beta < this._lowerBetaLimit) {
                this.beta = this._lowerBetaLimit;
            }
        }

        if (this._upperBetaLimit === null || this._upperBetaLimit === undefined) {
            if (this._allowUpsideDown && this.beta < -Math.PI) {
                this.beta = this.beta + (2 * Math.PI);
            }
        } else {
            if (this.beta > this._upperBetaLimit) {
                this.beta = this._upperBetaLimit;
            }
        }

        if (this._lowerAlphaLimit !== null && this.alpha < this._lowerAlphaLimit) {
            this.alpha = this._lowerAlphaLimit;
        }
        if (this._upperAlphaLimit !== null && this.alpha > this._upperAlphaLimit) {
            this.alpha = this._upperAlphaLimit;
        }

        if (this._lowerRadiusLimit !== null && this.radius < this._lowerRadiusLimit) {
            this.radius = this._lowerRadiusLimit;
            this.inertialRadiusOffset = 0;
        }
        if (this._upperRadiusLimit !== null && this.radius > this._upperRadiusLimit) {
            this.radius = this._upperRadiusLimit;
            this.inertialRadiusOffset = 0;
        }
    }

    protected _initCache(): void {
        super._initCache();

        this._cache._target = new Vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        this._cache.alpha = undefined;
        this._cache.beta = undefined;
        this._cache.radius = undefined;
    }

    protected _updateCache(): void {
        super._updateCache();
        this._cache._target!.from(this._getTargetPosition());
        this._cache.alpha = this.alpha;
        this._cache.beta = this.beta;
        this._cache.radius = this.radius;
    }

    protected _getViewMatrix(): Mat {
        const cosa = Math.cos(this.alpha);
        const sina = Math.sin(this.alpha);
        const cosb = Math.cos(this.beta);
        let sinb = Math.sin(this.beta);

        if (sinb === 0)
            sinb = 1e-6;

        const target = this._getTargetPosition();
        this._computationVector.from(this.radius * cosa * sinb, this.radius * cosb, this.radius * sina * sinb);

        if (this._upVector.x !== 0 || this._upVector.y !== 1.0 || this._upVector.z !== 0) {
            Mat.TransformCoordinates(this._YToUpMatrix, this._computationVector, this._computationVector);
        }

        Vec3.Add(target, this._computationVector, this._newPosition);

        this._position.from(this._newPosition);
        let up = this.upVector;
        if (sinb < 0)
            up.negate();
        
        this._computeViewMatrix(this._position, target, up);

        this._currentTarget = target;
        return this._viewMatrix;
    }

    protected _isSyncViewMatrix(): boolean {
        if (!super._isSyncViewMatrix())
            return false;

        return this._cache._target!.equals(this._getTargetPosition())
            && this._cache.alpha === this.alpha
            && this._cache.beta === this.beta
            && this._cache.radius === this.radius;
    }
}