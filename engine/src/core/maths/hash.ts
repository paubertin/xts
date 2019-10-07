import { uint32 } from "./uint32";
import { uint64 } from "./uint64";
import { IUint } from "./uint";
import { Buffer } from 'buffer';

function toUTF8Array(str: string) {
    const len = str.length;
    const utf8 = [];
    for (let i = 0; i < len; i++) {
        let c = str.charCodeAt(i);
        if (c < 0x80)
            utf8.push(c);
        else if (c < 0x800)
            utf8.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
        else if (c < 0xd800 || c >= 0xe000)
            utf8.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
        else {
            // surrogate pair
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
            utf8.push(
                0xf0 | (c >> 18),
                0x80 | ((c >> 12) & 0x3f),
                0x80 | ((c >> 6) & 0x3f),
                0x80 | (c & 0x3f)
            );
        }
    }

    return new Uint8Array(utf8);
}

function toBuffer(input: string | ArrayBuffer | Buffer | Uint8Array): Uint8Array | Buffer {
    if (input instanceof ArrayBuffer)
        return new Uint8Array(input);
    else if (typeof input === 'string')
        return toUTF8Array(input);
    return input;
}

interface IClonable<T> {
    clone(): T;
}

function isClonable<T>(obj: {}): obj is IClonable<T> {
    return obj.hasOwnProperty('clone');
}

abstract class AHash<T extends IUint> extends uint64 {
    protected _memSize!: number;
    protected _totalLen!: number;
    protected abstract _size: number;
    protected _memory?: Uint8Array | Buffer;

    protected seed!: T;
    protected v1!: T;
    protected v2!: T;
    protected v3!: T;
    protected v4!: T;

    protected abstract _primes: {
        P1: T,
        P2: T,
        P3: T,
        P4: T,
        P5: T,
    };

    protected constructor() {
        super(NaN);
    }

    public compute(input: string | ArrayBuffer | Buffer): T {
        return this.update(input).digest();
    }

    public update(value: string | ArrayBuffer | Buffer) {
        const input = toBuffer(value);
        const len = input.length;
        if (len === 0) return this;

        this._totalLen += len;

        const memory = this._memSize === 0
            ? input instanceof Buffer
                ? new Buffer(this._size)
                : new Uint8Array(this._size)
            : this._memory!
            ;

        if (this._memSize + len < this._size) {
            if (input instanceof Buffer)
                input.copy(memory, this._memSize, 0, len);
            else
                memory.set(input.subarray(0, len), this._memSize);

            this._memSize += len;
            this._memory = memory;

            return this;
        }

        let p = 0;
        const bEnd = p + len;
        const inc = this._getIncrement();

        if (this._memSize > 0) {
            if (input instanceof Buffer)
                input.copy(memory, this._memSize, 0, this._size - this._memSize);
            else
                memory.set(input.subarray(0, this._size - this._memSize), this._memSize);

            let i = 0;
            for (const v of this._vn) {
                this._shiftUpdate(v, memory, i);
                i += inc;
            }

            p += this._size - this._memSize;
            this._memSize = 0;
        }

        if (p <= bEnd - this._size) {
            const limit = bEnd - this._size
            do {
                for (const v of this._vn) {
                    this._shiftUpdate(v, input, p)
                    p += inc
                }
            } while (p <= limit)
        }

        if (p < bEnd) {
            if (input instanceof Buffer)
                input.copy(memory, this._memSize, p, bEnd);
            else
                memory.set(input.subarray(p, bEnd), this._memSize);

            this._memSize = bEnd - p;
        }

        this._memory = memory;
        return this;
    }

    protected _getIncrement(): number {
        return this._size / 4;
    }

    protected get _vn(): [T, T, T, T] {
        return [this.v1, this.v2, this.v3, this.v4];
    }

    protected abstract _shiftUpdate(v: T, m: Uint8Array | Buffer, p: number): void;
    protected abstract _digest(m: Uint8Array | Buffer, h: T): T

    protected get uintConstructor(): typeof uint32 | typeof uint64 {
        if (this._size === 16)
            return uint32;
        else if (this._size === 32)
            return uint64;

        throw new Error('Could not find appropriate ctor');
    }

    public reseed(seed: IClonable<T> | string | number) {
        this.seed = isClonable(seed)
            ? seed.clone()
            : new this.uintConstructor(seed as any) as unknown as T
            ;

        this.v1 = this.seed
            .clone()
            .add(this._primes.P1)
            .add(this._primes.P2) as T
            ;
        this.v2 = this.seed.clone().add(this._primes.P2) as T;
        this.v3 = this.seed.clone() as T;
        this.v4 = this.seed.clone().subtract(this._primes.P1) as T;
        this._totalLen = 0;
        this._memSize = 0;
        this._memory = undefined;
    }

    public digest(): T {
        const m = this._memory;
        if (m === undefined)
            throw new ReferenceError('Hash Memory not set, .update() has to be called before digest()');
        const { P5 } = this._primes;
        const h =
            this._totalLen >= this._size
                ? this.v1
                    .rotateLeft(1)
                    .add(this.v2.clone().rotateLeft(7))
                    .add(this.v3.clone().rotateLeft(12))
                    .add(this.v4.clone().rotateLeft(18))
                : this.seed.clone().add(P5);
        const hash = this._digest(m, h as T);

        // Reset the state
        this.reseed(this.seed as any);

        return hash;
    }
}

class _Hash32 extends AHash<uint32> {
    protected _primes = {
        P1: new uint32('2654435761'),
        P2: new uint32('2246822519'),
        P3: new uint32('3266489917'),
        P4: new uint32('668265263'),
        P5: new uint32('374761393'),
    };

    public constructor(seed: uint32 | string | number, protected _size: 16 = 16) {
        super();
        this.reseed(seed);
    }

    protected _shiftUpdate(v: uint32, m: Uint8Array | Buffer, p: number) {
        this._updateUint(v, (m[p + 1] << 8) | m[p], (m[p + 3] << 8) | m[p + 2]);
    }

    protected _digest(m: Uint8Array | Buffer, h: uint32): uint32 {
        const { P1, P2, P3, P4, P5 } = this._primes;

        const u = new uint32(NaN);
        h.add(u.fromNumber(this._totalLen));

        let i = 0;
        const inc = this._getIncrement();
        while (i <= this._memSize - inc) {
            u.fromBits((m[i + 1] << 8) | m[i], (m[i + 3] << 8) | m[i + 2]);
            h.add(u.multiply(P3))
                .rotateLeft(17)
                .multiply(P4)
                ;
            i += inc;
        }

        while (i < this._memSize) {
            u.fromBits(m[i++], 0);
            h.add(u.multiply(P5))
                .rotateLeft(11)
                .multiply(P1)
                ;
        }

        h.xor(h.clone().shiftRight(15)).multiply(P2);
        h.xor(h.clone().shiftRight(13)).multiply(P3);
        h.xor(h.clone().shiftRight(16));

        return h;
    }

    private _updateUint(uint: uint32, low: number, high: number) {
        const { P1, P2 } = this._primes;
        let b00 = P2.low;
        let b16 = P2.high;

        let c00 = low * b00;
        let c16 = c00 >>> 16;

        c16 += high * b00;
        c16 &= 0xffff; // Not required but improves performance
        c16 += low * b16;

        let a00 = uint.low + (c00 & 0xffff);
        let a16 = a00 >>> 16;

        a16 += uint.high + (c16 & 0xffff);

        let v = (a16 << 16) | (a00 & 0xffff);
        v = (v << 13) | (v >>> 19);

        a00 = v & 0xffff;
        a16 = v >>> 16;

        b00 = P1.low;
        b16 = P1.high;

        c00 = a00 * b00;
        c16 = c00 >>> 16;

        c16 += a16 * b00;
        c16 &= 0xffff; // Not required but improves performance
        c16 += a00 * b16;

        uint.low = c00 & 0xffff;
        uint.high = c16 & 0xffff;
    }
}

class _Hash64 extends AHash<uint64> {
    protected _primes = {
        P1: new uint64('11400714785074694791'),
        P2: new uint64('14029467366897019727'),
        P3: new uint64('1609587929392839161'),
        P4: new uint64('9650029242287828579'),
        P5: new uint64('2870177450012600261'),
    };

    public constructor(seed: uint64 | string | number, protected _size: 32 = 32) {
        super();
        this.reseed(seed);
    }

    protected _shiftUpdate(v: uint64, m: Uint8Array | Buffer, p: number) {
        v.add(new uint64((m[p + 1] << 8) | m[p], (m[p + 3] << 8) | m[p + 2], (m[p + 5] << 8) | m[p + 4], (m[p + 7] << 8) | m[p + 6])
            .multiply(this._primes.P2))
            .rotateLeft(31)
            .multiply(this._primes.P1)
    }

    private _shiftDigest(h: uint64, v: uint64): void {
        h.xor(
          v.multiply(this._primes.P2)
            .rotateLeft(31)
            .multiply(this._primes.P1)
        );
        h.multiply(this._primes.P1).add(this._primes.P4);
      }

    protected _digest(m: Uint8Array | Buffer, h: uint64): uint64 {
        const { P1, P2, P3, P4, P5 } = this._primes;

        if (this._totalLen >= this._size) {
            for (const v of this._vn) {
                this._shiftDigest(h, v);
            }
        }

        const u = new uint64(NaN);
        h.add(u.fromNumber(this._totalLen));

        let i = 0;
        const inc = this._getIncrement();
        while (i <= this._memSize - inc) {
            u.fromBits(
                (m[i + 1] << 8) | m[i],
                (m[i + 3] << 8) | m[i + 2],
                (m[i + 5] << 8) | m[i + 4],
                (m[i + 7] << 8) | m[i + 6]
            );
            u.multiply(P2)
                .rotateLeft(31)
                .multiply(P1)
            ;
            h.xor(u)
                .rotateLeft(27)
                .multiply(P1)
                .add(P4)
            ;
            i += inc;
        }

        if (i + 4 <= this._memSize) {
            u.fromBits((m[i + 1] << 8) | m[i], (m[i + 3] << 8) | m[i + 2], 0, 0);
            h.xor(u.multiply(P1))
                .rotateLeft(23)
                .multiply(P2)
                .add(P3);
            i += 4;
        }

        while (i < this._memSize) {
            u.fromBits(m[i++], 0, 0, 0);
            h.xor(u.multiply(P5))
                .rotateLeft(11)
                .multiply(P1);
        }

        h.xor(h.clone().shiftRight(33)).multiply(P2);
        h.xor(h.clone().shiftRight(29)).multiply(P3);
        h.xor(h.clone().shiftRight(32));

        return h;
    }
}

export class Hash {

    public static hash(seed: uint32): _Hash32;
    public static hash(seed: uint32, input: string | ArrayBuffer | Buffer): uint32;
    public static hash(seed: uint64): _Hash64;
    public static hash(seed: uint64, input: string | ArrayBuffer | Buffer): uint64;
    public static hash(seed: string | number, type: 32 | 64): _Hash32 | _Hash64;
    public static hash(seed: string | number, input: string | ArrayBuffer | Buffer, type: 32 | 64): uint32 | uint64;
    public static hash(seed: uint32 | uint64 | string | number, input?: string | ArrayBuffer | Buffer | 32 | 64, type?: 32 | 64): uint32 | uint64 | _Hash32 | _Hash64 {
        let instance;
        if (input === undefined) {
            if (seed instanceof uint32)
                instance = new _Hash32(seed);
            else
                instance = new _Hash64(seed);

            return instance;
        }
        else if (typeof input === 'number') {
            if (input === 32)
                instance = new _Hash32(seed as string | number);
            else
                instance = new _Hash64(seed as string | number);

            return instance;
        }
        else {
            if (seed instanceof uint32)
                instance = new _Hash32(seed);
            else if (seed instanceof uint64)
                instance = new _Hash64(seed);
            else if (type === 32)
                instance = new _Hash32(seed);
            else
                instance = new _Hash64(seed);
            return instance.update(input).digest() as uint32 | uint64;
        }
    }
}

const defaultSeed = 574269;

export const Hash32 = Hash.hash(defaultSeed, 32) as _Hash32;
export const Hash64 = Hash.hash(defaultSeed, 64) as _Hash64;