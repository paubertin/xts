export enum LogLevel {
    DEBUG = 0,
    LOG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
};

export const ArrayType = {
    Array: Array,
    Float32: Float32Array,
    Float64: Float64Array,
}

/*
const CONFIG = {
    LOGLEVEL: LogLevel.DEBUG,
    LOGBUFFER: false,
    ARRAYTYPE: ArrayType.Array,
    window: {
        fullscreen: true,
        color: [0.04, 0.04, 0.04, 1.0],
    },
};

export default CONFIG;
*/