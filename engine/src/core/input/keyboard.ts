import {  KeyUpEvent, KeyDownEvent } from '../events/inputEvent';
import { bool } from '../utils/types';

export enum Key {
    UNKNOWN,
    A,
    B,
    C,
    D,
    E,
    F,
    G,
    H,
    I,
    J,
    K,
    L,
    M,
    N,
    O,
    P,
    Q,
    R,
    S,
    T,
    U,
    V,
    W,
    X,
    Y,
    Z,
    LEFT,
    RIGHT,
    UP,
    DOWN,
    ENTER,
    SPACE,
}

interface KeyboardState {
    up: Key[];
    down: Key[];
}

export class Keyboard {
    private _state: KeyboardState = { up: [], down: []};
    private _previousState: KeyboardState = { up: [], down: []};
    private _keys: Key[] = [];
    private _keysUp: Key[] = [];
    private _keysDown: Key[] = [];

    constructor() {
    }

    public onKeyUp(keyEvent: KeyUpEvent): void {
        const idx = this._keys.indexOf(keyEvent.key);
        this._keys.splice(idx, 1);
        this._keysUp.push(keyEvent.key);
        this._state.up.push(keyEvent.key);
    }

    public onKeyDown(keyEvent: KeyDownEvent): void {
        this._state.down.push(keyEvent.key);
        if (!this._keys.includes(keyEvent.key)) {
            this._keys.push(keyEvent.key);
            this._keysDown.push(keyEvent.key);
        }
    }

    public isKeyDown(...keys: Key[]): bool {
        for (let key of keys) {
            if (this._keys.includes(key)) return true;
        }
        return false
    }

    public update(time: number): void {
        this._keysUp = [];
        this._keysDown = [];
        this._previousState.up = this._state.up;
        this._previousState.down = this._state.down;
        this._state.up = [];
        this._state.down = [];
    }

    public wasPressed(key: Key): bool {
        return !this._state.down.includes(key) && this._previousState.down.includes(key);
    }

    public static toKey(code: number): Key {
        switch (code) {
            case 13: return Key.ENTER;
            case 32: return Key.SPACE;
            case 37: return Key.LEFT;
            case 38: return Key.UP;
            case 39: return Key.RIGHT;
            case 40: return Key.DOWN;
            case 65: return Key.A;
            case 66: return Key.B;
            case 67: return Key.C;
            case 68: return Key.D;
            case 69: return Key.E;
            case 70: return Key.F;
            case 71: return Key.G;
            case 72: return Key.H;
            case 73: return Key.I;
            case 74: return Key.J;
            case 75: return Key.K;
            case 76: return Key.L;
            case 77: return Key.M;
            case 78: return Key.N;
            case 79: return Key.O;
            case 80: return Key.P;
            case 81: return Key.Q;
            case 82: return Key.R;
            case 83: return Key.S;
            case 84: return Key.T;
            case 85: return Key.U;
            case 86: return Key.V;
            case 87: return Key.W;
            case 88: return Key.X;
            case 89: return Key.Y;
            case 90: return Key.Z;
            default: return Key.UNKNOWN;
        }
    }
}