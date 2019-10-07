import { int, Nullable } from "src/core/utils/types"
import { Logger } from "src/core/utils/log"
import { uint32 } from "src/core/maths/uint32";
import { Hash32 } from "src/core/maths/hash";

export function SetGenericProperty<T>(list: Map<uint32, T>, name: string, value: T): boolean {
    Logger.assert(name !== '');

    const hash: uint32 = Hash32.compute(name);
    let it = list.get(hash);
    list.set(hash, value);
    return it ? true : false;
}

export function GetGenericProperty<T>(list: Map<uint32, T>, name: string): Nullable<T> {
    const hash: uint32 = Hash32.compute(name);
    let it = list.get(hash);
    return it ? it : null;
}