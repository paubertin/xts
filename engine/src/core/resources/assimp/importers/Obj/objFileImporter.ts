import { BaseImporter, aiImporterDesc, aiImporterFlags } from '../../baseImporter';
import { IOSystem } from '../../iosystem';
import { File } from '../../../file';
import { Importer } from '../../importer';
import { aiScene } from '../../scene';
import { int } from 'src/core/utils/types';
import { DeadlyImportError } from '../../errors';
import { ObjFileParser } from './objFileParser';

export class ObjFileImporter extends BaseImporter {

    protected static ObjMinSize: int = 16;

    protected static description: aiImporterDesc = {
        name: 'WaveFront Object Importer',
        author: '',
        maintainer: '',
        comments: 'surfaces not imported',
        flags: aiImporterFlags.SupportTextFlavour,
        minMajor: 0,
        minMinor: 0,
        maxMajor: 0,
        maxMinor: 0,
        fileExtensions: ['obj'],
    };

    public canRead(file: File, ioHandler: IOSystem, checkSig: boolean): boolean {
        if (!checkSig) {
            return BaseImporter.SimpleExtensionCheck(file, 'obj');
        }
        else {
            const tokens = ['mtllib', 'usemtl', 'v ', 'vt ', 'vn ', 'o ', 'g ', 's ', 'f '];
            return BaseImporter.SearchFileHeaderForToken(ioHandler, file, tokens, 200, false, true);
        }
    }

    public getInfo(): aiImporterDesc {
        return ObjFileImporter.description;
    }

    protected _internalReadFile(file: File, scene: aiScene): void {
        if (!file.content || (file.size && file.size < ObjFileImporter.ObjMinSize)) {
            throw new DeadlyImportError('OBJ-File is too small...');
        }

        const content: string | ArrayBuffer = file.content;

        let modelName;
        const pos = file.path.lastIndexOf('/');
        if (pos !== -1) {
            modelName = file.path.substring(pos + 1, file.size - pos - 1);
        }
        else {
            modelName = file.name;
        }

        const parser = new ObjFileParser(content, modelName, null, this._progress, file.name);
    }
}