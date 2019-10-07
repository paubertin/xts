import { int } from "./types";

export function BIT(x: int): int {
    return 1 << x;
}

export function getExtension(path: string): string {
    return (path.substring( path.lastIndexOf( '.' ) + 1, path.length ) || path).toLowerCase();
}

export function isAlphaNumeric(ch: string) {
    return ch.match(/^[a-z0-9]+$/i) !== null;
}

export function isAlpha(ch: string) {
    return ch.match(/^[a-z]+$/i) !== null;
}