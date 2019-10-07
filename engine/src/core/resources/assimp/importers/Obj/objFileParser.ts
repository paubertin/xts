import { int, char, Nullable } from "src/core/utils/types";
import * as std from 'tstl';
import { Obj } from "./objFileData";
import { IOSystem } from "../../iosystem";
import { ProgressHandler } from "../../progressHandler";
import { Logger } from "src/core/utils/log";

type DataArray = std.Vector<char>;
type DataArrayIt = std.Vector.Iterator<char>;

export class ObjFileParser {
    public static BufferSize: int = 4096;

    public constructor(fileContent: string | ArrayBuffer, modelName: string, io: Nullable<IOSystem>,
        progress: Nullable<ProgressHandler>, originalObjFileName: string) {
        this._io = io;
        this._progress = progress;
        this._originalObjFileName = originalObjFileName;

        this._model = new Obj.Model();
        this._model.modelName = modelName;

        this._model.defaultMaterial = new Obj.Material();
        this._model.defaultMaterial.name = ObjFileParser.DEFAULT_MATERIAL;
        this._model.materialLib.push_back(ObjFileParser.DEFAULT_MATERIAL);
        this._model.materialMap.set(ObjFileParser.DEFAULT_MATERIAL, this._model.defaultMaterial);

        this.parseFile(fileContent);
    }

    public parseFile(fileContent: string | ArrayBuffer) {
        console.log('parse file...', fileContent);
        if (fileContent instanceof ArrayBuffer) {
            const view = new Uint8Array(fileContent);
            this._eol = view.findIndex((v) => v === 10);
            let line: Uint8Array;
            while (this._eol !== -1) {
                line = view.slice(this._cursor, this._eol);
                // console.log('  ', String.fromCharCode.apply(null, line as any));
                switch(line[0]) {
                    case 35: { // #     parse a comment
                        this.skipLine();
                        break;
                    }
                    case 111: { // o    object
                        this.getObjectName(line);
                        break;
                    }
                    default: {
                        this.skipLine();
                        break;
                    }
                }
                let sliced = view.slice(this._eol + 1);
                const neol = sliced.findIndex((e) => e === 10);
                if (neol === -1)
                    this._eol = -1;
                else
                    this._eol += neol + 1;
            }
        }
    }

    private skipLine(): void {
        this._cursor = this._eol + 1;
    }

    private getObjectName(line: Uint8Array): void {
        let pos = line.findIndex((v) => v === 32);
        if (pos !== -1) {
            pos += 1;
            let token = [];
            while (line[pos] !== 32 && pos < line.length) {
                token.push(line[pos]);
                ++pos;
            }
            if (token.length > 0) {
                const strObjName = String.fromCharCode.apply(null, token);
                this._model!.current = null;
                for (let it = this._model!.objects.begin(); !it.equals(this._model!.objects.end()); it = it.next()) {
                    if (it.value.name === strObjName) {
                        this._model!.current = it.value;
                        break;
                    }
                }
                if (this._model!.current === null) {
                    this._createObject(strObjName);
                }
            }
        }
        this.skipLine();
    }

    private _createObject(name: string): void {
        if (!this._model) return;

        this._model.current = new Obj.Object();
        this._model.current.name = name;
        this._model.objects.push_back(this._model.current);

        this._createMesh(name);

        if (this._model.currentMaterial) {
            this._model.currentMesh!.materialIndex = this._getMaterialIndex(this._model.currentMaterial.name);
            this._model.currentMesh!.material = this._model.currentMaterial;
        }
    }

    private _createMesh(name: string): void {
        if (!this._model) return;

        this._model.currentMesh = new Obj.Mesh(name);
        this._model.meshes.push_back(this._model.currentMesh);
        const meshId = (this._model.meshes.size() - 1);
        if (this._model.current !== null) {
            this._model.current.meshes.push_back(meshId);
        }
        else {
            Logger.error('Obj: No object detected to attach a new mesh instance.');
        }
    }

    private _getMaterialIndex(name: string): int {
        let matIndex: int = -1;
        if (name === '') {
            return matIndex;
        }
        for (let i = 0; i < this._model!.materialLib.size(); ++i) {
            if (name === this._model!.materialLib.at(i)) {
                matIndex = i;
                break;
            }
        }
        return matIndex;
    }

    private static DEFAULT_MATERIAL: string = 'DefaultMaterial';
    private _dataIt!: DataArrayIt;
    private _dataItEnd!: DataArrayIt;
    private _model: Nullable<Obj.Model> = null;
    private _cursor: int = 0;
    private _eol: int = -1;
    private _line: int = 0;
    private _buffer: Array<char> = new Array<char>(ObjFileParser.BufferSize);
    private _io: Nullable<IOSystem> = null;
    private _progress: Nullable<ProgressHandler> = null;
    private _originalObjFileName: string = '';
}