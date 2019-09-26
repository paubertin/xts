import { IVec, Vec } from "src/core/interfaces";

export abstract class AVec implements IVec {
    public buffer: Vec;

    constructor(buffer: Vec) {
        this.buffer = buffer;
    }

    public get length(): number {
        return 2;
    }

    abstract [Symbol.iterator](): IterableIterator<number>;
}