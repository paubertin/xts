import { TypedArray, TypedArrayConstructor, TYPEDARRAY_CTORS, isTypedArray, typeOf, arrayTypeToType } from "src/core/memory/types";
import { Type, ArrayType } from "src/core/memory/types";
import { Logger } from "src/core/utils/log";
import { MemoryPool, PoolManager } from "src/core/memory/pool";
import { GLfloat2 } from "src/core/utils/tuples";

export class Vec2 {
    private _data!: TypedArray;

    private static pool: MemoryPool = new MemoryPool();
    private static pools: Map<Type, MemoryPool> = new Map<Type, MemoryPool>();

    public static new(type?: Type): Vec2;
    public static new(x: number, type?: Type): Vec2;
    public static new(vec: Vec2): Vec2;
    public static new(array: TypedArrayConstructor): Vec2;
    public static new(array: [number, number], type?: Type): Vec2;
    public static new(x: number, y: number, type?: Type): Vec2;
    public static new(x?: number | [number, number] | Vec2 | TypedArrayConstructor | Type, y?: number | Type, type?: Type): Vec2 {
        let _type = Vec2.getType(x, y, type);
        let pool = Vec2.pools.get(_type);
        if (!pool) {
            pool = new MemoryPool();
            Vec2.pools.set(_type, pool);
        }

        let array = pool.malloc(_type, 2);
        if (!array) {
            throw new Error('not enough space');
        }
        try {
            return PoolManager.get(Vec2).getOne(array, x, y);
        }
        catch (err) {
            throw err;
        }
    }

    public delete(): void {
        let pool = Vec2.pools.get(this.type);
        Logger.assert(pool !== undefined);
        (<MemoryPool>pool).free(this._data);
        PoolManager.release(this);
    }

    // private constructor() {}

    private static _assign(vec: Vec2, data: TypedArray, x?: number | [number, number] | Vec2 | TypedArrayConstructor, y?: number): void {
        vec._data = data;
        if (x !== undefined) {
            if (typeof x === 'number') {
                if (typeof y === 'number') {
                    vec._data[0] = x;
                    vec._data[1] = y;
                }
                else {
                    vec._data[0] = x;
                    vec._data[1] = x;
                }
            }
            else if (x instanceof Vec2) {
                vec._data[0] = x.x;
                vec._data[1] = x.y;
            }
            else if (Array.isArray(x)) {
                Logger.assert(x.length === 2, 'Wrong size: default vector instead');
                Logger.assert(y === undefined, 'Wrong arguments');
                vec._data[0] = x[0];
                vec._data[1] = x[1];
            }
            else if (isTypedArray(x)) {
                Logger.assert(x.length === 2, 'Wrong size!: default vector instead');
                vec._data[0] = (x as any)[0];
                vec._data[1] = (x as any)[1];
            }
        }
    }

    public static assign(vec: Vec2, data: TypedArray, x?: number | [number, number] | Vec2 | TypedArrayConstructor, y?: number): void {
        vec._data = data;
        if (x !== undefined) {
            if (typeof x === 'number') {
                if (typeof y === 'number') {
                    vec._data[0] = x;
                    vec._data[1] = y;
                }
                else {
                    vec._data[0] = x;
                    vec._data[1] = x;
                }
            }
            else if (x instanceof Vec2) {
                vec._data[0] = x.x;
                vec._data[1] = x.y;
            }
            else if (Array.isArray(x)) {
                Logger.assert(x.length === 2, 'Wrong size: default vector instead');
                Logger.assert(y === undefined, 'Wrong arguments');
                vec._data[0] = x[0];
                vec._data[1] = x[1];
            }
            else if (isTypedArray(x)) {
                Logger.assert(x.length === 2, 'Wrong size!: default vector instead');
                vec._data[0] = (x as any)[0];
                vec._data[1] = (x as any)[1];
            }
        }
    }

    private static getType(x?: number | [number, number] | Vec2 | TypedArrayConstructor | Type, y?: number | Type, type?: Type): Type {
        let _type: Type;
        try {
            if (x === undefined) {
                _type = Type.float;
            }
            else if (typeof x === 'number') {
                if (y === undefined) {
                    _type = Type.float;
                }
                else if (typeof y === 'number') {
                    if (type === undefined) {
                        _type = Type.float;
                    }
                    else {
                        _type = type;
                    }
                }
                else {
                    _type = y;
                }
            }
            else if (x instanceof Vec2) {
                _type = x.type;
            }
            else if (isTypedArray(x)) {
                _type = typeOf(<TypedArrayConstructor>x);
            }
            else if (Array.isArray(x)) {
                if (y === undefined) {
                    _type = Type.float;
                }
                else if (typeof y !== 'number') {
                    _type = y;
                }
                else {
                    _type = Type.float;
                }
            }
            else {
                _type = <Type>x;
            }
        }
        catch(e) {
            _type = Type.float;
        }
        return _type;
    }

    public get type(): Type {
        return arrayTypeToType(<ArrayType>this._data.constructor.name);
    }

    public constructor(type?: Type);
    public constructor(x: number, type?: Type);
    public constructor(vec: Vec2);
    public constructor(array: TypedArrayConstructor);
    public constructor(array: [number, number], type?: Type);
    public constructor(x: number, y: number, type?: Type);
    public constructor(x?: number | [number, number] | Vec2 | TypedArrayConstructor | Type, y?: number | Type, type?: Type) {
        let _type = Vec2.getType(x, y, type);
        Vec2.assign(this, new TYPEDARRAY_CTORS[_type](2), x as number | [number, number] | Vec2 | undefined, y as number | undefined);
    }

    public get x(): number {
        return this._data[0];
    }

    public get y(): number {
        return this._data[1];
    }

    public set x(x: number) {
        this._data[0] = x;
    }

    public set y(y: number) {
        this._data[1] = y;
    }

    public to(type: Type): Vec2 {
        let res = new Vec2(type);
        res.x = this.x;
        res.y = this.y;
        return res;
    }

    public clamp(min: GLfloat, max: GLfloat): Vec2;
    public clamp(min: GLfloat2, max: GLfloat2): Vec2;
    public clamp(min: GLfloat | GLfloat2, max: GLfloat | GLfloat2): Vec2 {
        if (typeof min === 'number' && typeof max === 'number') {
            this._data[0] = Math.max(min, Math.min(max, this._data[0]));
            this._data[1] = Math.max(min, Math.min(max, this._data[1]));
        }
        else if (Array.isArray(min) && Array.isArray(max)) {
            this._data[0] = Math.max(min[0], Math.min(max[0], this._data[0]));
            this._data[1] = Math.max(min[1], Math.min(max[1], this._data[1]));
        }
        return this;
    }

    public toArray(): number[] {
        return [this.x, this.y];
    }
}