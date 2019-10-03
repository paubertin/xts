import { BIT } from '../utils';

export enum KeyBoardEventType {
    KEYDOWN = BIT(0),
    KEYUP = BIT(1)
}

export class KeyBoardInfo {
    constructor(public type: KeyBoardEventType, public event: KeyboardEvent) {
    }
}