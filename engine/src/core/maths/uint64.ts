import { Nullable, int } from "../utils/types";
import { IUint } from "./uint";

export class uint64 implements IUint {
    private _a00: number = 0;
    private _a16: number = 0;
    private _a32: number = 0;
    private _a48: number = 0;

    private _remainder: Nullable<uint64> = null;

    private static RadixPowerCache = {
        16: new uint64( Math.pow(16, 5) ),
        10: new uint64( Math.pow(10, 5) ),
        2:  new uint64( Math.pow(2, 5) ),
    }

    private static RadixCache = {
        16: new uint64(16),
        10: new uint64(10),
        2: new uint64(2),
    };

    constructor(loFirst8: number, loSecond8: number, hiFirst8: number, hiSecond8: number);
    constructor(lo32: number, hi32: number);
    constructor(value: number);
    constructor(strValue: string, radix?: number);
    constructor(a00: number | string, a16?: number, a32?: number, a48?: number) {
        if (typeof a00 === 'string') {
            this.fromString(a00, <number>a16);
        }
        else {
            if (typeof a16 === 'undefined') {
                this.fromNumber(a00);
            }
            else {
                this.fromBits(a00, a16, a32!, a48!);
            }
        }
    }

    public toNumber(): number {
        return (this._a16 * 65536) + this._a00;
    }

    public toString(radix: number = 10): string {
        // @ts-ignore
        const radixUint: uint64 = uint64.RadixCache[String(radix)] || new uint64(radix);

        if ( !this.gt(radixUint) ) return this.toNumber().toString(radix)

        let self = this.clone();
        let res = new Array(64);
        let i;
        for (i = 63; i >= 0; i--) {
            self.divide(radixUint);
            res[i] = self._remainder!.toNumber().toString(radix);
            if ( !self.gt(radixUint) ) break;
        }
        res[i-1] = self.toNumber().toString(radix);

        return res.join('');
    }

    public clone(): uint64 {
        return new uint64(this._a00, this._a16, this._a32, this._a48);
    }

    public negate(): this {
        let v = ( ~this._a00 & 0xFFFF ) + 1;
        this._a00 = v & 0xFFFF;
        v = (~this._a16 & 0xFFFF) + (v >>> 16);
        this._a16 = v & 0xFFFF;
        v = (~this._a32 & 0xFFFF) + (v >>> 16);
        this._a32 = v & 0xFFFF;
        this._a48 = (~this._a48 + (v >>> 16)) & 0xFFFF;

        return this;
    }

    public add(other: uint64): this {
        var a00 = this._a00 + other._a00;

        var a16 = a00 >>> 16;
        a16 += this._a16 + other._a16;

        var a32 = a16 >>> 16;
        a32 += this._a32 + other._a32;

        var a48 = a32 >>> 16;
        a48 += this._a48 + other._a48;

        this._a00 = a00 & 0xFFFF;
        this._a16 = a16 & 0xFFFF;
        this._a32 = a32 & 0xFFFF;
        this._a48 = a48 & 0xFFFF;

        return this;
    }

    public subtract(other: uint64): this {
        return this.add(other.clone().negate());
    }

    public multiply(other: uint64): this {
        const a00 = this._a00;
        const a16 = this._a16;
        const a32 = this._a32;
        const a48 = this._a48;
        const b00 = other._a00;
        const b16 = other._a16;
        const b32 = other._a32;
        const b48 = other._a48;

        const c00 = a00 * b00;

        let c16 = c00 >>> 16;
        c16 += a00 * b16;
        let c32 = c16 >>> 16;
        c16 &= 0xFFFF;
        c16 += a16 * b00;;

        c32 += c16 >>> 16;
        c32 += a00 * b32;
        let c48 = c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a32 * b00;

        c48 += c32 >>> 16;
        c48 += a00 * b48;
        c48 &= 0xFFFF;
        c48 += a16 * b32;
        c48 &= 0xFFFF;
        c48 += a32 * b16;
        c48 &= 0xFFFF;
        c48 += a48 * b00;

        this._a00 = c00 & 0xFFFF;
        this._a16 = c16 & 0xFFFF;
        this._a32 = c32 & 0xFFFF;
        this._a48 = c48 & 0xFFFF;

        return this;
    }

    public divide(other: uint64): this {
        if ( (other._a16 == 0) && (other._a32 == 0) && (other._a48 == 0) ) {
            if (other._a00 == 0) throw new Error('division by zero');

            // other == 1: this
            if (other._a00 == 1) {
                this._remainder = new uint64(0);
                return this;
            }
        }

        // other > this: 0
        if ( other.gt(this) ) {
            this._remainder = this.clone();
            this._a00 = 0;
            this._a16 = 0;
            this._a32 = 0;
            this._a48 = 0;
            return this;
        }
        // other == this: 1
        if ( this.equals(other) ) {
            this._remainder = new uint64(0);
            this._a00 = 1;
            this._a16 = 0;
            this._a32 = 0;
            this._a48 = 0;
            return this;
        }

        // Shift the divisor left until it is higher than the dividend
        let _other = other.clone();
        let i = -1;
        while ( !this.lt(_other) ) {
            // High bit can overflow the default 16bits
            // Its ok since we right shift after this loop
            // The overflown bit must be kept though
            _other.shiftLeft(1, true);
            i++;
        }

        // Set the remainder
        this._remainder = this.clone();
        // Initialize the current result to 0
        this._a00 = 0;
        this._a16 = 0;
        this._a32 = 0;
        this._a48 = 0;
        for (; i >= 0; i--) {
            _other.shiftRight(1);
            // If shifted divisor is smaller than the dividend
            // then subtract it from the dividend
            if ( !this._remainder.lt(_other) ) {
                this._remainder.subtract(_other);
                // Update the current result
                if (i >= 48)
                    this._a48 |= 1 << (i - 48);
                else if (i >= 32)
                    this._a32 |= 1 << (i - 32);
                else if (i >= 16)
                    this._a16 |= 1 << (i - 16);
                else
                    this._a00 |= 1 << i;
            }
        }

        return this;
    }

    public equals(other: uint64): boolean {
        return (this._a48 == other._a48) && (this._a00 == other._a00)
            && (this._a32 == other._a32) && (this._a16 == other._a16);
    }

    public lt(other: uint64): boolean {
        if (this._a48 < other._a48) return true;
		if (this._a48 > other._a48) return false;
		if (this._a32 < other._a32) return true;
		if (this._a32 > other._a32) return false;
		if (this._a16 < other._a16) return true;
		if (this._a16 > other._a16) return false;
		return this._a00 < other._a00;
    }

    public gt(other: uint64): boolean {
        if (this._a48 > other._a48) return true;
		if (this._a48 < other._a48) return false;
		if (this._a32 > other._a32) return true;
		if (this._a32 < other._a32) return false;
		if (this._a16 > other._a16) return true;
		if (this._a16 < other._a16) return false;
		return this._a00 > other._a00;
    }

    public shiftRight(n: int): this {
        n %= 64;
        if (n >= 48) {
            this._a00 = this._a48 >> (n - 48);
            this._a16 = 0;
            this._a32 = 0;
            this._a48 = 0;
        }
        else if (n >= 32) {
            n -= 32;
            this._a00 = ( (this._a32 >> n) | (this._a48 << (16-n)) ) & 0xFFFF;
            this._a16 = (this._a48 >> n) & 0xFFFF;
            this._a32 = 0;
            this._a48 = 0;
        }
        else if (n >= 16) {
            n -= 16;
            this._a00 = ( (this._a16 >> n) | (this._a32 << (16-n)) ) & 0xFFFF;
            this._a16 = ( (this._a32 >> n) | (this._a48 << (16-n)) ) & 0xFFFF;
            this._a32 = (this._a48 >> n) & 0xFFFF;
            this._a48 = 0;
        }
        else {
            this._a00 = ( (this._a00 >> n) | (this._a16 << (16-n)) ) & 0xFFFF;
            this._a16 = ( (this._a16 >> n) | (this._a32 << (16-n)) ) & 0xFFFF;
            this._a32 = ( (this._a32 >> n) | (this._a48 << (16-n)) ) & 0xFFFF;
            this._a48 = (this._a48 >> n) & 0xFFFF;
        }

        return this;
    }

    public shiftLeft(n: int, allowOverflow: boolean = false): this {
        n %= 64;
        if (n >= 48) {
            this._a48 = this._a00 << (n - 48);
            this._a32 = 0;
            this._a16 = 0;
            this._a00 = 0;
        }
        else if (n >= 32) {
            n -= 32;
            this._a48 = (this._a16 << n) | (this._a00 >> (16-n));
            this._a32 = (this._a00 << n) & 0xFFFF;
            this._a16 = 0;
            this._a00 = 0;
        }
        else if (n >= 16) {
            n -= 16;
            this._a48 = (this._a32 << n) | (this._a16 >> (16-n));
            this._a32 = ( (this._a16 << n) | (this._a00 >> (16-n)) ) & 0xFFFF;
            this._a16 = (this._a00 << n) & 0xFFFF;
            this._a00 = 0;
        }
        else {
            this._a48 = (this._a48 << n) | (this._a32 >> (16-n));
            this._a32 = ( (this._a32 << n) | (this._a16 >> (16-n)) ) & 0xFFFF;
            this._a16 = ( (this._a16 << n) | (this._a00 >> (16-n)) ) & 0xFFFF;
            this._a00 = (this._a00 << n) & 0xFFFF;
        }
        if (!allowOverflow) {
            this._a48 &= 0xFFFF;
        }

        return this;
    }

    public rotateLeft(n: int): this {
        n %= 64;
        if (n == 0) return this;
        if (n >= 32) {
            // A.B.C.D
            // B.C.D.A rotl(16)
            // C.D.A.B rotl(32)
            let v = this._a00;
            this._a00 = this._a32;
            this._a32 = v;
            v = this._a48;
            this._a48 = this._a16;
            this._a16 = v;
            if (n == 32) return this;
            n -= 32;
        }

        const high = (this._a48 << 16) | this._a32;
        const low = (this._a16 << 16) | this._a00;

        const _high = (high << n) | (low >>> (32 - n));
        const _low = (low << n) | (high >>> (32 - n));

        this._a00 = _low & 0xFFFF;
        this._a16 = _low >>> 16;
        this._a32 = _high & 0xFFFF;
        this._a48 = _high >>> 16;

        return this;
    }

    public xor(other: uint64): this {
        this._a00 ^= other._a00;
        this._a16 ^= other._a16;
        this._a32 ^= other._a32;
        this._a48 ^= other._a48;

        return this;
    }

    public fromString(str: string, radix: number = 10): this {
        /*
            In Javascript, bitwise operators only operate on the first 32 bits 
            of a number, even though parseInt() encodes numbers with a 53 bits 
            mantissa.
            Therefore uint64(<Number>) can only work on 32 bits.
            The radix maximum value is 36 (as per ECMA specs) (26 letters + 10 digits)
            maximum input value is m = 32bits as 1 = 2^32 - 1
            So the maximum substring length n is:
            36^(n+1) - 1 = 2^32 - 1
            36^(n+1) = 2^32
            (n+1)ln(36) = 32ln(2)
            n = 32ln(2)/ln(36) - 1
            n = 5.189644915687692
            n = 5
            */
        // @ts-ignore
        const radixUint = uint64.RadixPowerCache[String(radix)] || new uint64( Math.pow(radix, 5) );

        for (let i = 0, len = str.length; i < len; i += 5) {
            var size = Math.min(5, len - i);
            var value = parseInt( str.slice(i, i + size), radix );
            this.multiply(size < 5 ? new uint64( Math.pow(radix, size) ) : radixUint)
                .add( new uint64(value) );
        }
        return this;
    }

    public fromNumber(value: number): this {
        this._a00 = value & 0xFFFF;
        this._a16 = value >>> 16;
        this._a32 = 0;
        this._a48 = 0;
        return this;
    }

    public fromBits(loFirst8: number, loSecond8: number, hiFirst8: number, hiSecond8: number): this;
    public fromBits(lo32: number, hi32: number): this;
    public fromBits(a00: number, a16: number, a32?: number, a48?: number): this {
        if (typeof a32 == 'undefined') {
            this._a00 = a00 & 0xFFFF;
            this._a16 = a00 >>> 16;
            this._a32 = a16 & 0xFFFF;
            this._a48 = a16 >>> 16;
        }
        else {
            this._a00 = a00 | 0;
            this._a16 = a16 | 0;
            this._a32 = a32 | 0;
            this._a48 = a48! | 0;
        }
        return this;
    }
}