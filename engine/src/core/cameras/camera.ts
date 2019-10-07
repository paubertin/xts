import { Mat, Vec3 } from '../maths';
import { SceneNode, INodeCache } from '../scene/sceneNode';
import { IScene } from '../scene/scene';
import { ViewPort, IViewPortOwnerLike } from '../graphics/viewport';
import { Nullable, float, bool, int } from '../utils/types';
import { TimeStep } from '../utils/timestep';

export interface ICameraState {
    fov: float;
}

export interface ICameraCache extends INodeCache {
    position?: Vec3;
    upVector?: Vec3;

    mode?: int;
    minZ?: float;
    maxZ?: float;

    fov?: float;
    fovMode?: int;
    aspectRatio?: float;

    orthoLeft?: Nullable<float>;
    orthoRight?: Nullable<float>;
    orthoTop?: Nullable<float>;
    orthoBottom?: Nullable<float>;
    renderHeight?: float;
    renderWidth?: float;
}
export class Camera extends SceneNode implements IViewPortOwnerLike {
    public static readonly PERSPECTIVE = 0;
    public static readonly ORTHOGRAPHIC = 1;

    public static readonly VERTICAL_FIXED = 0;
    public static readonly HORIZONTAL_FIXED = 1;

    protected _mode = Camera.PERSPECTIVE;
    protected _minZ = 1.0;
    protected _maxZ = 10000.0;
    protected _fov = 0.8; // radians
    protected _fovMode = Camera.VERTICAL_FIXED;

    protected _inertia: float = 0.9;


    protected _cache!: ICameraCache;

    protected _orthoLeft: Nullable<float> = null;
    protected _orthoRight: Nullable<float> = null;
    protected _orthoBottom: Nullable<float> = null;
    protected _orthoTop: Nullable<float> = null;

    protected _globalPosition: Vec3 = Vec3.Zeros;


    protected _position: Vec3 = Vec3.Zeros;
    public upVector: Vec3 = Vec3.Y;

    public viewport: ViewPort = new ViewPort(0, 0, 1, 1);

    protected _computedViewMatrix: Mat = Mat.Identity;

    protected _projectionMatrix: Mat = Mat.Zeros;

    private _shouldRefreshFrustrum: boolean = false;

    protected _storedState: Nullable<ICameraState> = null;

    constructor(name: string, position: Vec3, scene: IScene) {
        super(name, scene);
        scene.addCamera(this);
        this.position = position;
    }

    public getViewMatrix(force: boolean = false): Mat {
        if (!force && this._isSyncViewMatrix())
            return this._computedViewMatrix;
        

        this.updateCache();
        this._computedViewMatrix = this._getViewMatrix();
        this._childUpdateId++;
        this._shouldRefreshFrustrum = true;

        // notify change ?

        this._worldMatrix.invertFrom(this._computedViewMatrix);
        return this._computedViewMatrix;
    }

    protected _getViewMatrix(): Mat {
        return Mat.Identity;
    }

    public get inertia(): float {
        return this._inertia;
    }

    public get position(): Vec3 {
        return this._position;
    }

    public set position(p: Vec3) {
        this._position.from(p);
    }

    public set mode(mode: number) {
        this._mode = mode;
    }

    public getProjectionMatrix(force: boolean = false): Mat {
        if (!force && this._isSyncProjectionMatrix())
            return this._projectionMatrix;

        this._cache.mode = this._mode;
        this._cache.minZ = this._minZ;
        this._cache.maxZ = this._maxZ;

        this._shouldRefreshFrustrum = true;

        const engine = this._getEngine();

        if (this._mode === Camera.PERSPECTIVE) {
            this._cache.fov = this._fov;
            this._cache.fovMode = this._fovMode;
            this._cache.aspectRatio = engine.getAspectRatio(this);

            if (this._minZ <= 0)
                this._minZ = 0.1;

            Mat.Perspective(this._fov, engine.getAspectRatio(this), this._minZ, this._maxZ, this._projectionMatrix);
        }
        else {
            const halfWidth = engine.getRenderWidth() * 0.5;
            const halfHeight = engine.getRenderHeight() * 0.5;

            this._orthoLeft = -1;
            this._orthoRight = 1;
            this._orthoBottom = -1;
            this._orthoTop = 1;
            Mat.Orthographic(this._orthoLeft || -halfWidth,
                this._orthoRight || halfWidth,
                this._orthoBottom || -halfHeight,
                this._orthoTop || halfHeight,
                this._minZ, this._maxZ, this._projectionMatrix);
            //Mat.Orthographic(0, engine.getRenderWidth(), 0, engine.getRenderHeight(), this._minZ, this._maxZ, this._projectionMatrix);
            
            this._cache.orthoLeft = this._orthoLeft;
            this._cache.orthoRight = this._orthoRight;
            this._cache.orthoBottom = this._orthoBottom;
            this._cache.orthoTop = this._orthoTop;
            this._cache.renderHeight = engine.getRenderHeight();
            this._cache.renderWidth = engine.getRenderWidth();
        }
        // this._projectionMatrix.print();
        return this._projectionMatrix;
    }

    public getWorldMatrix(): Mat {
        if (this._isSyncViewMatrix())
            return this._worldMatrix;

        this.getViewMatrix();
        return this._worldMatrix;
    }

    public computeWorldMatrix(): Mat {
        return this.getWorldMatrix();
    }

    public update(step: TimeStep): void {
        this._checkInputs();
    }

    public storeState(): Camera {
        this._storedState = {
            fov: this._fov,
        };
        return this;
    }

    protected _restoreStateValues(): boolean {
        if (this._storedState === null)
            return false;

        this._fov = this._storedState.fov;

        return true;
    }

    public restoreState(): boolean {
        return this._restoreStateValues();
    }

    protected _checkInputs(): void {

    }

    protected _isSyncViewMatrix(): boolean {
        if (!super._isSync())
            return false;

        return this._cache.position!.equals(this.position)
            && this._cache.upVector!.equals(this.upVector)
            && this._isSyncWithParent()
        ;
    }

    protected _initCache(): void {
        super._initCache();

        this._cache.position = new Vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        this._cache.upVector = new Vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);

        this._cache.mode = undefined;
        this._cache.minZ = undefined;
        this._cache.maxZ = undefined;

        this._cache.fov = undefined;
        this._cache.fovMode = undefined;
        this._cache.aspectRatio = undefined;

        this._cache.orthoLeft = undefined;
        this._cache.orthoRight = undefined;
        this._cache.orthoBottom = undefined;
        this._cache.orthoTop = undefined;
        this._cache.renderWidth = undefined;
        this._cache.renderHeight = undefined;
    }

    protected _updateCache(): void {
        super._updateCache();

        this._cache.position!.from(this.position);
        this._cache.upVector!.from(this.upVector);

    }

    protected _isSyncProjectionMatrix(): boolean {
        let check = this._cache.mode === this._mode
            && this._cache.minZ === this._minZ
            && this._cache.maxZ === this._maxZ
        ;

        if (!check) return false;

        let engine = this._getEngine();

        if (this._mode === Camera.PERSPECTIVE) {
            check = this._cache.fov === this._fov
                && this._cache.fovMode === this._fovMode
                && this._cache.aspectRatio === engine.getAspectRatio(this)
            ;
        }
        else {
            check = this._cache.orthoLeft === this._orthoLeft
                && this._cache.orthoRight === this._orthoRight
                && this._cache.orthoBottom === this._orthoBottom
                && this._cache.orthoTop === this._orthoTop
                && this._cache.renderWidth === engine.getRenderWidth()
                && this._cache.renderHeight === engine.getRenderHeight()
            ;
        }

        return check;
    }

    protected _isSync(): boolean {
        return this._isSyncViewMatrix() && this._isSyncProjectionMatrix();
    }
}