import { IOSystem } from "./iosystem";
import { int, Nullable, float, double } from "src/core/utils/types";
import { File } from "../file";
import { fstat } from "fs";
import { isAlpha } from "src/core/utils";
import { Logger } from "src/core/utils/log";
import { Importer } from "./importer";
import { aiScene } from "./scene";
import { ProgressHandler } from "./progressHandler";

export enum aiImporterFlags {
    /** Indicates that there is a textual encoding of the
     *  file format; and that it is supported.*/
    SupportTextFlavour = 0x1,

    /** Indicates that there is a binary encoding of the
     *  file format; and that it is supported.*/
    SupportBinaryFlavour = 0x2,

    /** Indicates that there is a compressed encoding of the
     *  file format; and that it is supported.*/
    SupportCompressedFlavour = 0x4,

    /** Indicates that the importer reads only a very particular
      * subset of the file format. This happens commonly for
      * declarative or procedural formats which cannot easily
      * be mapped to #aiScene */
    LimitedSupport = 0x8,

    /** Indicates that the importer is highly experimental and
      * should be used with care. This only happens for trunk
      * (i.e. SVN) versions, experimental code is not included
      * in releases. */
    Experimental = 0x10,
}

export interface aiImporterDesc {
    name: string;
    author: string;
    maintainer: string;
    comments: string;
    flags: int;
    minMajor: int;
    minMinor: int;
    maxMajor: int;
    maxMinor: int;
    fileExtensions: string[];
}

export abstract class BaseImporter {
    public abstract getInfo(): aiImporterDesc;
    public abstract canRead(file: File, ioHandler: IOSystem, checkSig: boolean): boolean;
    protected abstract _internalReadFile(file: File, scene: aiScene): void;

    private _updateImporterScale(imp: Importer): void {
        Logger.assert(this._importerScale !== 0.0);
        Logger.assert(this._fileScale !== 0.0);

        const activeScale: double = this._importerScale  * this._fileScale;

        imp.setPropertyFloat('APP_SCALE_FACTOR', activeScale);

        Logger.debug(`updateImporterScale set: ${activeScale}`);
    }

    protected _setupProperties(imp: Importer): void {
        // nothing here
    }

    public getErrorText(): string {
        return this._errorText;
    }

    public readFile(imp: Importer, file: File): Nullable<aiScene> {
        this._progress = imp.progressHandler;
        if (!this._progress) return null;

        this._setupProperties(imp);

        let scene = new aiScene();

        try {
            this._internalReadFile(file, scene/*, filter*/);
            this._updateImporterScale(imp);
        }
        catch (err) {
            Logger.error(err.what());
            return null;
        }
        return scene;
    }

    public static SearchFileHeaderForToken(ioSystem: IOSystem, file: File, tokens: string[],
        searchBytes: int = 200, tokensSol: boolean = false, noAlphaBeforeTokens: boolean = false): boolean {
        
        if (!file.content) return false;

        const buffer = file.content.substring(0, searchBytes);
        let token: string;
        for (let _token of tokens) {
            token = _token.toLowerCase();
            const r = buffer.indexOf(token);

            if (r === -1)
                continue;

            if (noAlphaBeforeTokens && (r !== 0 && isAlpha(buffer[r - 1])))
                continue;
            
            if (!tokensSol || r === 0 || buffer[r - 1] === '\r' || buffer[r - 1] === '\n') {
                Logger.debug(`Found positive match for header keyword: ${_token}`);
                return true;
            }
        }
        return false;
    }

    public static SimpleExtensionCheck(file: File, ext0: string, ext1: string = '', ext2: string = ''): boolean {
        if (file.ext === ext0)
            return true;
        
        if (ext1 && file.ext === ext1)
            return true;
        
        if (ext2 && file.ext === ext2)
            return true;

        return false;
    }

    public static GetExtension(file: string): string {
        let pos = file.lastIndexOf('.');
        if (pos === -1)
            return '';

        const ret = file.substring(pos + 1);
        return ret.toLowerCase();
    }

    protected _importerScale: double = 1.0;
    protected _fileScale: double = 1.0;

    protected _errorText: string = '';
    protected _progress: Nullable<ProgressHandler> = null;
}