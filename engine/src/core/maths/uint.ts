export interface IUint {
    // Math
    add(x: IUint): this;
    subtract(x: IUint): this;
    multiply(x: IUint): this;
    divide(x: IUint): this;

    // Compare
    equals(x: IUint): boolean;
    // eq(x: this): boolean;
    // greaterThan(x: this): boolean;
    gt(x: IUint): boolean;
    // lessThan(x: this): boolean;
    lt(x: IUint): boolean;

    // Bitwise
    negate(): this;
    // or(x: this): this;
    // and(x: this): this;
    // xor(x: this): this;
    // not(x: this): this;
    shiftRight(n: number): this;
    // shiftr(n: number): this;
    shiftLeft(n: number): this;
    // shiftl(n: number): this;
    rotateLeft(n: number): this;
    // rotl(n: number): this;
    // rorateRight(n: number): this;
    // rotr(n: number): this;

    // Deserialize
    fromNumber(n: number): this;
    fromBits(...bits: number[]): this;
    fromString(integer: string, radix?: number): this;

    // Serialize
    toNumber(): number;
    toString(base?: number): string;
    clone(): IUint;
}

export interface IUintConstructor<T extends IUint> {
    new (value: number): T;
    new (low: number, high: number): T;
    new (strValue: string, radix?: number): T;
}

export interface IUint64Constructor<T extends IUint> extends IUintConstructor<T> {
    new (a00: number, a16: number, a32: number, a48: number): T;
}