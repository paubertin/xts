export interface IAsset {
    readonly name: string;
    readonly data: any;
}

export abstract class Asset implements IAsset {
    protected static TYPE: string;
    protected _name!: string;
    protected _data!: string;

    public type(): string {
        return Asset.TYPE;
    }

    public get name(): string {
        return this._name;
    }

    public get data(): string {
        return this._data;
    }
}