import { Nullable, int } from "../utils/types";

export class File {
    private _name: string;
    private _path: string;
    private _ext: Nullable<string> = null;
    private _content: Nullable<string | ArrayBuffer> = null;

    constructor(name: string, path?: string, content?: string) {
        this._name = name;
        this._path = path ? path : name;
        this._ext = File.GetExtension(this._path);
        if (content !== undefined)
            this._content = content;
    }

    public get name(): string {
        return this._name;
    }

    public get path(): string {
        return this._path;
    }

    public get content(): Nullable<string | any> {
        return this._content;
    }

    public set content(content: string | any) {
        this._content = content;
    }

    public get size(): int {
        if (this._content instanceof ArrayBuffer)
            return this._content.byteLength;
        else if (this._content !== null)
            return this._content.length;
        return 0;
    }

    public get ext(): string {
        if (this._ext === null) {
            this._ext = File.GetExtension(this._path);
        }
        return this._ext;
    }

    public static GetExtension(path: string): string {
        let pos = path.lastIndexOf('.');
        if (pos === -1)
            return '';

        const ret = path.substring(pos + 1);
        return ret.toLowerCase();
    }
}