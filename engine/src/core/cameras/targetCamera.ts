import { Camera, ICameraCache, ICameraState } from "./camera";
import { Vec3, Mat, Vec2, Maths } from "../maths";
import { IScene } from "../scene/scene";
import { Quaternion } from "../maths/linearAlgebra/quaternion";
import { float, Nullable } from "../utils/types";

export interface ITargetCameraState extends ICameraState {
    position: Vec3;
    rotationQuaternion: Quaternion;
}

export interface ITargetCameraCache extends ICameraCache {
    rotationQuaternion?: Quaternion;
}

export class TargetCamera extends Camera {
    private _cachedRotationQuaternionZ = 0;
    private _defaultUp: Vec3 = Vec3.Y;

    protected _speed: float = 2.0;

    protected _cameraDirection: Vec3 = Vec3.Zeros;
    protected _cameraRotation: Vec2 = new Vec2(0, 0);

    protected _cameraTranformMatrix: Mat = Mat.Zeros;

    protected _cache!: ITargetCameraCache;

    private _referencePoint: Vec3 = Vec3.Z;
    private _transformedReferencePoint: Vec3 = Vec3.Zeros;

    protected _rotation: Vec3 = Vec3.Zeros;
    protected _rotationQuaternion: Quaternion = new Quaternion();

    protected _rotationMatrix: Mat = Mat.Zeros;

    protected _viewMatrix: Mat = Mat.Zeros;

    public updateUpVectorFromRotation: boolean = false;

    protected _currentTarget: Vec3 = Vec3.Zeros;
    protected _globalCurrentTarget: Vec3 = Vec3.Zeros;
    protected _globalCurrentUpVector: Vec3 = Vec3.Zeros;

    protected _storedState: Nullable<ITargetCameraState> = null;

    constructor(name: string, position: Vec3, scene: IScene) {
        super(name, position, scene);
    }

    public storeState(): TargetCamera {
        super.storeState();
        this._storedState!.position = this.position.clone();
        this._storedState!.rotationQuaternion = this._rotationQuaternion.clone();
        return this;
    }

    protected _restoreStateValues(): boolean {
        if (!super._restoreStateValues())
            return false;

        this.position = this._storedState!.position.clone();
        this._rotationQuaternion = this._storedState!.rotationQuaternion.clone();

        this._cameraDirection.from(0, 0, 0);
        this._cameraRotation.from(0, 0);
        
        return true;
    }

    protected _getViewMatrix(): Mat {
        this._updateCameraRotationMatrix();

        if (this._cachedRotationQuaternionZ !== this._rotationQuaternion.z) {
            this._rotateUpVectorWithCameraRotationMatrix();
            this._cachedRotationQuaternionZ = this._rotationQuaternion.z;
        }

        Mat.TransformCoordinates(this._rotationMatrix, this._referencePoint, this._transformedReferencePoint);

        Vec3.Add(this.position, this._transformedReferencePoint, this._currentTarget);

        if (this.updateUpVectorFromRotation) {
            Vec3.RotateByQuaternion(Vec3.Y, this._rotationQuaternion, this.upVector);
        }

        this._computeViewMatrix(this.position, this._currentTarget, this.upVector);
        return this._viewMatrix;

    }

    protected _needsToMove(): boolean {
        return Math.abs(this._cameraDirection.x) > 0 || Math.abs(this._cameraDirection.y) > 0 || Math.abs(this._cameraDirection.z) > 0;
    }

    protected _updatePosition(): void {
        if (this._parent) {
            let tmpMatrix = new Mat();
            tmpMatrix.invertFrom(this._parent.getWorldMatrix());
            let tmpVec = new Vec3();
            Mat.TransformNormal(tmpMatrix, this._cameraDirection, tmpVec);
            this.position.add(tmpVec);
            return;
        }
        this.position.add(this._cameraDirection);
    }

    protected _checkInputs(): void {
        const needToMove = this._needsToMove();
        const needToRotate = Math.abs(this._cameraRotation.x) > 0 || Math.abs(this._cameraRotation.y) > 0;

        if (needToMove) {
            this._updatePosition();
        }

        if (needToRotate) {
            this._rotation.x += this._cameraRotation.x;
            this._rotation.y += this._cameraRotation.y;

            const len = this._rotation.sqNorm;
            if (len > 0) {
                Quaternion.RotationYawPitchRoll(this._rotation.y, this._rotation.x, this._rotation.z, this._rotationQuaternion);
            }
        }

        if (needToMove) {
            if (Math.abs(this._cameraDirection.x) < this._speed * Maths.EPSILON) {
                this._cameraDirection.x = 0;
            }

            if (Math.abs(this._cameraDirection.y) < this._speed * Maths.EPSILON) {
                this._cameraDirection.y = 0;
            }

            if (Math.abs(this._cameraDirection.z) < this._speed * Maths.EPSILON) {
                this._cameraDirection.z = 0;
            }
            this._cameraDirection.mult(this._inertia);
        }

        if (needToRotate) {
            if (Math.abs(this._cameraRotation.x) < this._speed * Maths.EPSILON) {
                this._cameraRotation.x = 0;
            }

            if (Math.abs(this._cameraRotation.y) < this._speed * Maths.EPSILON) {
                this._cameraRotation.y = 0;
            }
            this._cameraRotation.mult(this._inertia);
        }

        super._checkInputs();
    }

    protected _computeViewMatrix(position: Vec3, target: Vec3, up: Vec3): void {
        if (this._parent) {
            const parentWorldMatrix = this._parent.getWorldMatrix();
            Mat.TransformCoordinates(parentWorldMatrix, position, this._globalPosition);
            Mat.TransformCoordinates(parentWorldMatrix, target, this._globalCurrentTarget);
            Mat.TransformNormal(parentWorldMatrix, up, this._globalCurrentUpVector);
            this._markSyncedWithParent();
        }
        else {
            this._globalPosition.from(position);
            this._globalCurrentTarget.from(target);
            this._globalCurrentUpVector.from(up);
        }
        Mat.LookAt(this._globalPosition, this._globalCurrentTarget, this._globalCurrentUpVector, this._viewMatrix);
    }

    protected _updateCameraRotationMatrix(): void {
        this._rotationMatrix.from(this._rotationQuaternion);
    }

    protected _initCache(): void {
        super._initCache();
        this._cache.rotationQuaternion = new Quaternion(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    }

    protected _updateCache(): void {
        super._updateCache();
        this._cache.rotationQuaternion!.from(this._rotationQuaternion);
    }

    private _rotateUpVectorWithCameraRotationMatrix(): TargetCamera {
        Mat.TransformNormal(this._rotationMatrix, this._defaultUp, this.upVector);
        return this;
    }

    protected _isSyncViewMatrix(): boolean {
        if (!super._isSyncViewMatrix())
            return false;

        return this._cache.rotationQuaternion!.equals(this._rotationQuaternion);
    }
}