import { Nullable, int } from "../utils/types";
import { IUint } from "./uint";

export class uint32 implements IUint {
    private _low: number = 0;
    private _high: number = 0;

    private _remainder: Nullable<uint32> = null;

    constructor(lo: number, hi: number);
    constructor(value: number);
    constructor(strValue: string, radix?: number);
    constructor(lo: number | string, hi?: number) {
        if (typeof lo === 'string') {
            this.fromString(lo, <number>hi);
        }
        else {
            if (typeof hi === 'undefined') {
                this.fromNumber(lo);
            }
            else {
                this.fromBits(lo, hi);
            }
        }
    }

    public get low(): number {
        return this._low;
    }

    public set low(low: number) {
        this._low = low;
    }

    public get high(): number {
        return this._high;
    }

    public set high(high: number) {
        this._high = high;
    }

    public toNumber(): number {
        return (this._high * 65536) + this._low;
    }

    public toString(radix: number = 10): string {
        return this.toNumber().toString(radix);
    }

    public clone(): uint32 {
        return new uint32(this._low, this._high);
    }

    public negate(): this {
        const v = (~this._low & 0xFFFF) + 1;
        this._low = v & 0xFFFF;
        this._high = (~this._high + (v >> 16)) & 0xFFFF;
        return this;
    }

    public add(other: uint32): this {
        const a00 = this._low + other._low;
        let a16 = a00 >> 16;
        a16 += this._high + other._high;
        this._low = a00 & 0xFFFF;
        this._high = a16 & 0xFFFF;
        return this;
    }

    public subtract(other: uint32): this {
        return this.add(other.clone().negate());
    }

    public multiply(other: uint32): this {
        const a16 = this._high;
        const a00 = this._low;
        const b16 = other._high;
        const b00 = other._low;

        let c00 = a00 * b00;
        let c16 = c00 >>> 16;

        c16 += a16 * b00;
        c16 &= 0xFFFF;
        c16 += a00 * b16;

        this._low = c00 & 0xFFFF;
        this._high = c16 & 0xFFFF;

        return this;
    }

    public divide(other: uint32): this {
        if ((other._low == 0) && (other._high == 0)) throw new Error('division by zero');

        // other == 1
        if (other._high == 0 && other._low == 1) {
            this._remainder = new uint32(0);
            return this;
        }

        // other > this: 0
        if (other.gt(this)) {
            this._remainder = this.clone();
            this._low = 0;
            this._high = 0;
            return this;
        }
        // other == this: 1
        if (this.equals(other)) {
            this._remainder = new uint32(0);
            this._low = 1;
            this._high = 0;
            return this;
        }

        // Shift the divisor left until it is higher than the dividend
        const _other = other.clone();
        let i = -1;
        while (!this.lt(_other)) {
            // High bit can overflow the default 16bits
            // Its ok since we right shift after this loop
            // The overflown bit must be kept though
            _other.shiftLeft(1, true);
            i++;
        }

        // Set the remainder
        this._remainder = this.clone();
        // Initialize the current result to 0
        this._low = 0;
        this._high = 0;
        for (; i >= 0; i--) {
            _other.shiftRight(1);
            // If shifted divisor is smaller than the dividend
            // then subtract it from the dividend
            if (!this._remainder.lt(_other)) {
                this._remainder.subtract(_other);
                // Update the current result
                if (i >= 16)
                    this._high |= 1 << (i - 16);
                else
                    this._low |= 1 << i;
            }
        }

        return this;
    }

    public equals(other: uint32): boolean {
        return this._low === other._low && this._high === other._high;
    }

    public lt(other: uint32): boolean {
        if (this._high < other._high) return true;
        if (this._high > other._high) return false;
        return this._low < other._low;
    }

    public gt(other: uint32): boolean {
        if (this._high > other._high) return true;
        if (this._high < other._high) return false;
        return this._low > other._low;
    }

    public shiftRight(n: int): this {
        if (n > 16) {
            this._low = this._high >> (n - 16);
            this._high = 0;
        } else if (n == 16) {
            this._low = this._high;
            this._high = 0;
        } else {
            this._low = (this._low >> n) | ( (this._high << (16-n)) & 0xFFFF );
            this._high >>= n;
        }

        return this;
    }

    public shiftLeft(n: int, allowOverflow: boolean = false): this {
        if (n > 16) {
            this._high = this._low << (n - 16);
            this._low = 0;
            if (!allowOverflow) {
                this._high &= 0xFFFF;
            }
        } else if (n == 16) {
            this._high = this._low;
            this._low = 0;
        } else {
            this._high = (this._high << n) | (this._low >> (16-n));
            this._low = (this._low << n) & 0xFFFF;
            if (!allowOverflow) {
                // Overflow only allowed on the high bits...
                this._high &= 0xFFFF;
            }
        }

        return this;
    }
    
    public rotateLeft(n: int): this {
        let v = (this._high << 16) | this._low;
        v = (v << n) | (v >>> (32 - n));
        this._low = v & 0xFFFF;
        this._high = v >>> 16;

        return this;
    }

    public xor(other: uint32): this {
        this._low ^= other._low;
        this._high ^= other._high;

        return this;
    }

    public fromString(str: string, radix: number = 10): this {
        let value = parseInt(str, radix || 10);
        this._low = value & 0xFFFF;
        this._high = value >>> 16;
        return this;
    }

    public fromNumber(value: number): this {
        this._low = value & 0xFFFF;
        this._high = value >>> 16;
        return this;
    }

    public fromBits(lo: number, hi: number): this {
        this._low = lo | 0;
        this._high = hi | 0;
        return this;
    }
}