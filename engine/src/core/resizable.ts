import { GLsizei2, GLfloat2 } from "./utils/tuples";

export abstract class Resizable {
    private _mutationObserver!: MutationObserver;

    private static instances: Resizable[] = [];
    private static readonly MUTATION_CONFIG: MutationObserverInit = {
        attributes: true,
        attributeFilter: ['style', 'class'],
        childList: true,
        subtree: true,
    };

    public constructor() {
        if (Resizable.instances.length === 0) {
            window.addEventListener('resize', this._resizeCallback);
        }
        Resizable.instances.push(this);
    }

    public static elementSize(element: HTMLElement): GLsizei2 | undefined {
        if (element === undefined || window === undefined || typeof window.devicePixelRatio !== 'number')
            return [0, 0];
        
        const scale = window.devicePixelRatio;
        const style = getComputedStyle(element);

        const pxUnits = style.width !== null && style.width.endsWith('px')
            && style.height !== null && style.height.endsWith('px');
        
        if (!pxUnits) return undefined;

        const sizef: GLfloat2 = [parseFloat(style.width as string), parseFloat(style.height as string)];
        const size: GLsizei2 = [Math.round(sizef[0] * scale), Math.round(sizef[1] * scale)];
        return size;
    }

    protected _resizeCallback(): void {
        console.log('on resize from RESIZABLE');
        Resizable.resize();
    }

    protected _mutationCallback(): void {
        this._mutationObserver.takeRecords();
        Resizable.resize(true);
    }

    protected observe(element: HTMLElement): void {
        if (element !== undefined) {
            this._mutationObserver = new MutationObserver(this._mutationCallback.bind(this));
        }
        this._mutationObserver.observe(element, Resizable.MUTATION_CONFIG);
    }

    protected abstract onResize(cacheSize: boolean): void;

    protected static resize(cacheSize: boolean = false): void {
        Resizable.instances.forEach((resizable) => resizable.onResize(cacheSize));
    }
}