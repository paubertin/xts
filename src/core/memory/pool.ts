import { align } from "./utils";
import * as std from 'tstl';
import { TypedArray, Type, sizeof, wrap } from "./types";

export interface MemoryPoolOptions {
    size: number;
    compact: boolean;
    split: boolean;
    minSplit: number;
}

export interface MemoryBlock {
    addr: number;
    size: number;
    next: MemoryBlock | null;
}

export class MemoryPool {
    private _buffer: ArrayBuffer;
    private _start: number;
    private _end: number;
    private _top: number;
    protected _u8: Uint8Array;
    protected _doCompact: boolean;
    protected _doSplit: boolean;
    protected _minSplit: number;

    private _free: MemoryBlock | null;
    private _used: MemoryBlock | null;

    constructor(options: Partial<MemoryPoolOptions> = {}) {
        this._buffer = new ArrayBuffer(options.size || 0x10000);
        this._start = 8;
        this._end = this._buffer.byteLength;
        this._top = this._start;
        this._free = null;
        this._used = null;

        this._u8 = new Uint8Array(this._buffer);

        this._doCompact = options.compact !== false;
        this._doSplit = options.split !== false;
        this._minSplit = options.minSplit || 16;
    }

    public stats() {
        const listStats = (block: MemoryBlock | null) => {
            let count = 0;
            let size = 0;
            while (block) {
                count++;
                size += block.size;
                block = block.next;
            }
            return { count, size };
        };
        const free = listStats(this._free);
        return {
            free,
            used: listStats(this._used),
            top: this._top,
            available: this._end - this._top + free.size,
            total: this._buffer.byteLength,
        };
    }

    public free(ptr: number | TypedArray): boolean {
        let addr: number;
        if (typeof ptr !== 'number') {
            if (ptr.buffer !== this._buffer) {
                return false;
            }
            addr = ptr.byteOffset;
        }
        else {
            addr = ptr;
        }
        let block = this._used;
        let prev: MemoryBlock | null = null;
        while (block) {
            if (block.addr === addr) {
                if (prev) {
                    prev.next = block.next;
                }
                else {
                    this._used = block.next;
                }
                this.insert(block);
                this._doCompact && this.compact();
                return true;
            }
            prev = block;
            block = block.next;
        }
        return false;
    }

    public calloc(type: Type, num: number): TypedArray | undefined;
    public calloc(size: number): number;
    public calloc(size: number | Type, num?: number): number | TypedArray | undefined {
        if (typeof size !== 'number') {
            if (num !== undefined) {
                const block = this.malloc(size, num);
                block && block.fill(0);
                return block;
            }
        }
        else {
            const addr = this.malloc(size);
            addr && this._u8.fill(0, addr, align(addr + size, 8));
            return addr;
        }
        return undefined;
    }

    public malloc(type: Type, num: number): TypedArray | undefined;
    public malloc(size: number): number;
    public malloc(size: number | Type, num?: number): number | TypedArray | undefined {
        if (typeof size !== 'number') {
            const addr = this.malloc(<number>num * sizeof(size));
            return addr ? wrap(size, this._buffer, addr, <number>num) : undefined;
        }
        else {
            if (size <= 0) return 0;

            size = align(size, 8);
            let top = this._top;
            const end = this._end;
            let block = this._free;
            let prev: MemoryBlock | null = null;

            while (block) {
                const isTop = block.addr + block.size >= top;
                if (isTop || block.size >= size) {
                    if (isTop && block.addr + size > end) {
                        return 0;
                    }
                    if (prev) {
                        prev.next = block.next;
                    }
                    else {
                        this._free = block.next;
                    }
                    block.next = this._used;
                    this._used = block;
                    if (isTop) {
                        block.size = size;
                        this._top = block.addr + size;
                    }
                    else if (this._doSplit) {
                        const excess = block.size - size;
                        if (excess >= this._minSplit) {
                            block.size = size;
                            this.insert({
                                addr: block.addr+ size,
                                size: excess,
                                next: null,
                            });
                            this._doCompact && this.compact();
                        }
                    }
                    return block.addr;
                }
                prev = block;
                block = block.next;
            }

            const addr = align(top, 8);
            top = addr + size;
            if (top <= end) {
                block = {
                    addr,
                    size,
                    next: this._used,
                };
                this._used = block;
                this._top = top;
                return addr;
            }
            return 0;
        }
    }

    private insert(block: MemoryBlock): void {
        let ptr = this._free;
        let prev: MemoryBlock | null = null;
        while (ptr) {
            if (block.addr <= ptr.addr) break;
            prev = ptr;
            ptr = ptr.next;
        }
        if (prev) {
            prev.next = block;
        }
        else {
            this._free = block;
        }
        block.next = ptr;
    }

    private compact(): void {

    }
}

class Pool<T extends {new(): T, assign(...args: any[]): void} = any> {
    private freeList: T[] = [];
    private expansion: number = 1;

    constructor(private classType: T, initialSize: number) {
        this.expand(initialSize)
    }

    public expand(size: number): void {
        for(let i = 0; i < size; ++i) {
            this.freeList.push(new this.classType());
        }
    }

    public getOne(...args: any[]): T {
        if (this.freeList.length <= 0) {
            this.expansion = Math.round(this.expansion * 1.2) + 1;
            this.expand(this.expansion);
        }
        let res = <T>this.freeList.pop();
        this.classType.assign(res, ...args);
        return res;
    }

    public release(obj: T): void {
        this.freeList.push(obj);
    }
}

export class PoolManager {
    public static size: number = 1;
    private static _instance: PoolManager;

    private pools: std.HashMap<string, Pool> = new std.HashMap<string, Pool>();

    constructor() {}

    public static init(): void {
        PoolManager._instance = new PoolManager();
    }

    public static getPool(klass: any): Pool | undefined {
        if (PoolManager._instance.pools.has(klass.prototype.constructor.name)) {
            return PoolManager._instance.pools.get(klass.prototype.constructor.name);
        }
        return undefined;
    }

    public static get(klass: any): Pool<any> {
        let pool = PoolManager.getPool(klass);
        if (!pool) {
            pool = new Pool(klass, PoolManager.size);
            PoolManager._instance.pools.set(klass.prototype.constructor.name, pool);
        }
        return pool;
    }

    public static release(obj: any): void {
        let pool = PoolManager.getPool(obj.__proto__.constructor);
        (<Pool>pool).release(obj);
    }
}