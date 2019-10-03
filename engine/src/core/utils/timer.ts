export class Timer {
    private _start: number = 0.0;
    private _tick: number = 0.0;
    private _end: number = 0.0;
    private _diff: number = 0.0;
    private _running: boolean = false;

    constructor(autoRun: boolean = true) {
        if (autoRun) {
            this.start();
        }
    }

    public start(): void {
        this._start = performance.now();
        this._running = true;
    }

    public stop(): void {
        this._end = performance.now();
        this._diff = this._end - this._start;
        this._running = false;
    }

    public reset(): void {
        this._diff = 0.0;
        this._tick = 0.0;
        if (this._running) {
            this._start = performance.now();
        }
    }

    public tick(): void {
        this._tick = performance.now();
    }

    public elapsed(): number {
        return 0.001 * this.elapsedMs();
    }

    public elapsedMs(): number {
        return performance.now() - this._tick;
    }

    public time(): number {
        return 0.001 * this.timeMs();
    }

    public timeMs(): number {
        if (this._running) {
            return performance.now() - this._start;
        }
        else {
            return this._diff;
        }
    }

}