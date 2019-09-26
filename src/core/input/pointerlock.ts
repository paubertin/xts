import { bool } from "../utils/types";

export class PointerLock {

    public static request(element: HTMLElement): void {
        if (element === undefined) {
            return;
        }

        if (PointerLock.active() && PointerLock._element() !== element) {
            document.exitPointerLock();
        }

        if (!PointerLock.active()) {
            element.requestPointerLock();
        }
    }

    public static exit(): void {
        document.exitPointerLock();
    }

    public static active(element?: HTMLElement): bool {
        return (element !== undefined && PointerLock._element() === element)
            || (element === undefined && PointerLock._element() !== undefined && PointerLock._element() !== null);
    }

    protected static _element(): HTMLElement {
        return <HTMLElement>document.pointerLockElement;
    }
}