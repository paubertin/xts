import { int } from "./types";

export function BIT(x: int): int {
    return 1 << x;
}

export function getExtension(path: string): string {
    return (path.substring( path.lastIndexOf( '.' ) + 1, path.length ) || path).toLowerCase();
}