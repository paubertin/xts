export const enum Type {
    int8 = 'int8',
    int16 = 'int16',
    int32 = 'int32',
    uint8 = 'uint8',
    uint16 = 'uint16',
    uint32 = 'uint32',
    float = 'float',
    double = 'double',
}

export function sizeof(type: Type): number {
    switch (type) {
        case Type.int8:
        case Type.uint8: return 1;
        case Type.int16:
        case Type.uint16: return 2;
        case Type.int32:
        case Type.uint32:
        case Type.float: return 4;
        case Type.double: return 8;
    }
}

export type ArrayType =
      'Int8Array'
    | 'Int16Array'
    | 'Int32Array'
    | 'Uint8Array'
    | 'Uint16Array'
    | 'Uint32Array'
    | 'Float32Array'
    | 'Float64Array'
;

export function arrayTypeToType(str: ArrayType): Type {
    switch (str) {
        case 'Int8Array': return Type.int8;
        case 'Int16Array': return Type.int16;
        case 'Int32Array': return Type.int32;
        case 'Uint8Array': return Type.uint8;
        case 'Uint16Array': return Type.uint16;
        case 'Uint32Array': return Type.uint32;
        case 'Float32Array': return Type.float;
        case 'Float64Array': return Type.double;
    }
}

export type TypedArray =
    | Float32Array
    | Float64Array
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array;

export type TypedArrayConstructor =
    | Uint8ArrayConstructor
    | Int8ArrayConstructor
    | Uint16ArrayConstructor
    | Int16ArrayConstructor
    | Uint32ArrayConstructor
    | Int32ArrayConstructor
    | Float32ArrayConstructor
    | Float64ArrayConstructor;

export const TYPEDARRAY_CTORS = {
    [Type.int8]: Int8Array,
    [Type.int16]: Int16Array,
    [Type.int32]: Int32Array,
    [Type.uint8]: Uint8Array,
    [Type.uint16]: Uint16Array,
    [Type.uint32]: Uint32Array,
    [Type.float]: Float32Array,
    [Type.double]: Float64Array,
};

export function isTypedArray(x: any): boolean {
    return x instanceof Int8Array
    || x instanceof Int16Array
    || x instanceof Int32Array
    || x instanceof Uint8Array
    || x instanceof Uint16Array
    || x instanceof Uint32Array
    || x instanceof Float32Array
    || x instanceof Float64Array;
}

export function typeOf(x: TypedArrayConstructor): Type {
    if (x instanceof Int8Array) {
        return Type.int8;
    }
    else if (x instanceof Int16Array) {
        return Type.int16;
    }
    else if (x instanceof Int32Array) {
        return Type.int32;
    }
    else if (x instanceof Uint8Array) {
        return Type.uint8;
    }
    else if (x instanceof Uint16Array) {
        return Type.uint16;
    }
    else if (x instanceof Uint32Array) {
        return Type.uint32;
    }
    else if (x instanceof Float32Array) {
        return Type.float;
    }
    else {
        return Type.double;
    }
}

export function wrap(type: Type, buffer: ArrayBuffer, addr: number, num: number): TypedArray {
    return new TYPEDARRAY_CTORS[type](buffer, addr, num);
}