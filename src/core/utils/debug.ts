export interface IDurationStats {
    update: number;
    render: number;
    readonly total: number;
}

export interface IFrameStats {
    id: number;
    delta: number;
    fps: number;
    duration: IDurationStats;

    reset(stats?: IFrameStats): void;
    clone(): IFrameStats;
}

export interface IDebugStats {
    currFrame: IFrameStats;
    prevFrame: IFrameStats;
}

export class FrameStats implements IFrameStats {
    private _id: number = 0;
    private _delta: number = 0;
    private _fps: number = 0;
    private _durationStats: IDurationStats;

    constructor() {
        this._durationStats = {
            update: 0,
            render: 0,
            get total(this: IDurationStats): number {
                return this.update + this.render;
            },
        };
    }

    public reset(stats?: FrameStats): void {
        if (stats) {
            this.id = stats.id;
            this.delta = stats.delta;
            this.fps = stats.fps;
            this.duration.update = stats.duration.update;
            this.duration.render = stats.duration.render;
        }
        else {
            this.id = 0;
            this.delta = 0;
            this.fps = 0;
            this.duration.update = 0;
            this.duration.render = 0;
        }
    }

    public clone(): FrameStats {
        const stats = new FrameStats();
        stats.reset(this);
        return stats;
    }

    public get id(): number {
        return this._id;
    }

    public get delta(): number {
        return this._delta;
    }

    public get fps(): number {
        return this._fps;
    }

    public get duration(): IDurationStats {
        return this._durationStats;
    }

    public set id(id: number) {
        this._id = id;
    }

    public set delta(delta: number) {
        this._delta = delta;
    }

    public set fps(fps: number) {
        this._fps = fps;
    }
}

export class Debugger {
    public stats: IDebugStats;

    constructor() {
        this.stats = {
            currFrame: new FrameStats(),
            prevFrame: new FrameStats(),
        };
    }
}
