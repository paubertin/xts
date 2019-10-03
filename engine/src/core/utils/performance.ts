import { double, int, bool, Nullable } from "./types";

export class RollingAverage {
    public average!: double;
    public variance!: double;

    protected _samples: Array<double>;
    protected _sampleCount!: int;
    protected _pos!: int;
    protected _m2!: double;

    public constructor(length: int) {
        this._samples = new Array<double>(length);
        this.reset();
    }

    public add(value: double): void {
        let delta: double;

        if (this.isFull()) {
            let lastValue = this._samples[this._pos];
            delta = lastValue - this.average;
            this.average -= delta / (this._sampleCount - 1);
            this._m2 -= delta * (lastValue - this.average);
        }
        else {
            this._sampleCount++;
        }

        delta = value - this.average;
        this.average += delta / (this._sampleCount);
        this._m2 += delta  * (value - this.average);

        this.variance = this._m2 / (this._sampleCount - 1);

        this._samples[this._pos]  = value;
        this._pos++;

        this._pos %= this._samples.length;
    }

    public reset(): void {
        this.average = 0;
        this.variance = 0;
        this._m2 = 0;
        this._sampleCount = 0;
        this._pos = 0;
    }

    public history(index: int): double {
        if ((index >= this._sampleCount) || (index >= this._samples.length)) {
            return 0;
        }

        let index0 = this._modulo(this._pos - index);
        return this._samples[this._modulo(index0 - index)];
    }

    public isFull(): bool {
        return this._sampleCount >= this._samples.length;
    }

    protected _modulo(idx: int): int {
        const max = this._samples.length;
        return ((idx % max) + max) %  max;
    }
}

export class PerformanceMonitor {
    private _enabled: bool = true;
    private _rollingFrameTime: RollingAverage;
    private _lastFrameTime: Nullable<double> = null;

    public constructor(sampleSize: int = 30) {
        this._rollingFrameTime = new RollingAverage(sampleSize);
    }

    public sampleFrame(timeMs: double = performance.now()): void {
        if (!this._enabled) return;
        if (this._lastFrameTime !== null) {
            let dt = timeMs - this._lastFrameTime;
            this._rollingFrameTime.add(dt);
        }
        this._lastFrameTime = timeMs;
    }

    public reset(): void {
        this._lastFrameTime = null;
        this._rollingFrameTime.reset();
    }

    public enable(): void {
        this._enabled = true;
    }

    public disable(): void {
        this._enabled = false;
        this._lastFrameTime = null;
    }

    public get isEnabled(): bool {
        return this._enabled;
    }

    public get isFull(): bool {
        return this._rollingFrameTime.isFull();
    }

    public get FPS(): double {
        let history = this._rollingFrameTime.history(0);
        if (history === 0) return 0;
        return 1000.0 / history;
    }

    public get averageFPS(): double {
        return 1000.0 / this._rollingFrameTime.average;
    }

    public get frameTime(): double {
        return this._rollingFrameTime.history(0);
    }

    public get averageFrameTime(): double {
        return this._rollingFrameTime.average;
    }

    public get averageFrameTimeVariance(): double {
        return this._rollingFrameTime.variance;
    }
}