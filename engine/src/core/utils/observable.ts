import { Nullable } from "./types";

export class EventState {
    public mask!: number;
    public skipNextObservers!: boolean;
    public target: any;
    public currentTarget: any;

    public lastReturnValue: any;

    constructor(mask: number, skipNextObservers: boolean = false, target?: any, currentTarget?: any) {
        this.initialize(mask, skipNextObservers, target, currentTarget);
    }

    public initialize(mask: number, skipNextObservers: boolean = false, target?: any, currentTarget?: any): EventState {
        this.mask = mask;
        this.skipNextObservers = skipNextObservers;
        this.target = target;
        this.currentTarget = currentTarget;
        return this;
    }
}

export class Observer<T> {
    protected _willBeUnregistered: boolean = false;
    protected _unregisterOnNextCall: boolean = false;

    constructor(public callback: (eventData: T, eventState: EventState) => void, public mask: number, public scope: any = null) {}

    public set unregisterOnNextCall(value: boolean) {
        this._unregisterOnNextCall = value;
    }

    public set willBeUnregistered(value: boolean) {
        this._willBeUnregistered = value;
    }

    public get unregisterOnNextCall(): boolean {
        return this._unregisterOnNextCall;
    }

    public get willBeUnregistered(): boolean {
        return this._willBeUnregistered;
    }
}

export class Observable<T> {
    private _observers: Array<Observer<T>> = new Array<Observer<T>>();

    private _eventState!: EventState;

    private _onObserverAdded: Nullable<(observer: Observer<T>) => void> = null;

    public get observers(): Array<Observer<T>> {
        return this._observers;
    }

    constructor(onObserverAdded?: (observer: Observer<T>) => void) {
        this._eventState = new EventState(0);

        if (onObserverAdded)
            this._onObserverAdded = onObserverAdded;
    }

    public add(callback: (eventData: T, eventState: EventState) => void, mask: number = -1,
        insertFirst: boolean = false, scope: any = null, unregisterOnFirstCall: boolean = false): Nullable<Observer<T>> {
        if (!callback) return null;

        let observer = new Observer<T>(callback, mask, scope);
        observer.unregisterOnNextCall = unregisterOnFirstCall;

        if (insertFirst)
            this._observers.unshift(observer);
        else
            this._observers.push(observer);

        if (this._onObserverAdded)
            this._onObserverAdded(observer);

        return observer;
    }

    public addOnce(callback: (eventData: T, eventState: EventState) => void): Nullable<Observer<T>> {
        return this.add(callback, undefined, undefined, undefined, true);
    }

    public remove(observer: Nullable<Observer<T>>): boolean {
        if (!observer) return false;

        let idx = this._observers.indexOf(observer);
        if (idx !== -1) {
            this._deferUnregister(observer);
            return true;
        }

        return false;
    }

    public hasObservers(): boolean {
        return this._observers.length > 0;
    }

    public notifyObservers(eventData: T, mask: number = -1, target?: any, currentTarget?: any): boolean {
        if (!this._observers.length) return true;

        let state = this._eventState;
        state.mask = mask;
        state.target = target;
        state.currentTarget = currentTarget;
        state.skipNextObservers = false;
        state.lastReturnValue = eventData;

        for (let observer of this._observers) {
            if (observer.willBeUnregistered) continue;

            if (observer.mask && mask) {
                if (observer.scope)
                    state.lastReturnValue = observer.callback.apply(observer.scope, [eventData, state]);
                else
                    state.lastReturnValue = observer.callback(eventData, state);

                if (observer.unregisterOnNextCall)
                    this._deferUnregister(observer);
            }

            if (state.skipNextObservers)
                return false;
        }

        return true;
    }

    private _deferUnregister(observer: Observer<T>): void {
        observer.unregisterOnNextCall = false;
        observer.willBeUnregistered = true;
        setTimeout(() => this._remove(observer), 0);
    }

    private _remove(observer: Nullable<Observer<T>>): boolean {
        if (!observer) return false;

        let idx = this._observers.indexOf(observer);
        if (idx !== -1) {
            this._observers.splice(idx, 1);
            return true;
        }

        return false;
    }
}