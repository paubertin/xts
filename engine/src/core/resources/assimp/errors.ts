export class AssimpError extends Error {
    constructor(msg: string) {
        super(msg)
    }

    public what(): string {
        return this.message;
    }
}

export class DeadlyImportError extends AssimpError {}