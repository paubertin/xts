export interface ILength {
    readonly length: number;
}

export interface Vec extends Iterable<number>, ILength {
    [id: number]: number;
}

export interface IVec {
    buffer: Vec;
}