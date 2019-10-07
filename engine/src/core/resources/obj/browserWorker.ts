import { Nullable } from "src/core/utils/types";
import { OBJ } from "./utils";

export class BrowserWorker {
    private _logging: boolean = true;
    private _worker: Nullable<Worker> = null;
    private _runnerImplName: Nullable<string> = null;
    private _callbacks: {
        meshBuilder: Nullable<Function>;
        onLoad: Nullable<Function>;
    } = {
        meshBuilder: null,
        onLoad: null,
    };
    private _terminateRequested: boolean = false;
    private _queuedMessage: Nullable<OBJ.IWorkerPayload> = null;
    private _started: boolean = false;
    private _forceCopy: boolean = false;

    public constructor() {
    }

    public get worker(): Nullable<Worker> {
        return this._worker;
    }

    private _reset(): void {
        this._logging = true;
        this._worker = null;

        this._runnerImplName = null;
        this._callbacks.meshBuilder = null;
        this._callbacks.onLoad = null;

        this._terminateRequested = false;
        this._queuedMessage = null;
        this._started = false;
        this._forceCopy = false;
    }

    public checkSupport(): void {
        // 
    }

    public set logging(enabled: boolean) {
        this._logging = enabled === true;
    }

    public set forceCopy(force: boolean) {
        this._forceCopy = force === true;
    }

    public set terminateRequested(terminateRequested: boolean) {
        this._terminateRequested = terminateRequested === true;
    }

    public setCallbacks(meshBuilder: Function, onLoad: Function): void {
        this._callbacks.meshBuilder = meshBuilder;
        this._callbacks.onLoad = onLoad;
    }

    public initWorker(code: string, runnerImplName: string): void {
        console.log('init worker', code);
        this.checkSupport();

        this._runnerImplName = runnerImplName;

        const blob = new Blob([code], { type: 'application/javascript'});
        this._worker = new Worker(window.URL.createObjectURL(blob));

        this._worker.addEventListener('message', (event: MessageEvent) => {
            return this._receiveWorkerMessage(event);
        });

        (this._worker as any).runtimeRef = this;

        this._postMessage();
    }

    private _receiveWorkerMessage(event: MessageEvent): void {
        console.log('this', this);
        const payload = event.data;
        switch (payload.cmd) {
            case 'meshData':
            case 'materialData':
            case 'imageData':
                break;
        }
        // TODO...
    }

    private _postMessage(): void {
        if (OBJ.Utils.isValid(this._queuedMessage) && OBJ.Utils.isValid(this._worker)) {
            if (this._queuedMessage!.data.input instanceof ArrayBuffer) {
                let content;
                if (this._forceCopy)
                    content = this._queuedMessage!.data.input.slice(0);
                else
                    content = this._queuedMessage!.data.input;
                this._worker!.postMessage(this._queuedMessage, [ content ]);
            }
            else {
                this._worker!.postMessage(this._queuedMessage);
            }
        }
    }
}