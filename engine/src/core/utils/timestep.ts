export class TimeStep {
    private _timeStep: number = 0.0;
    private _lastTime: number;

    constructor(initialTime: number) {
        this._lastTime = initialTime;
    }

    public update(currentTime: number): void {
        this._timeStep = currentTime - this._lastTime;
        this._lastTime = currentTime;
    }

    public get millis(): number {
        return this._timeStep;
    }

    public get seconds(): number {
        return this._timeStep * 0.001;
    }
}