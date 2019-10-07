import { BaseImporter, aiImporterDesc } from "./baseImporter";
import { int, float, Nullable } from "src/core/utils/types";
import { Mat } from "src/core/maths";
import { BaseProcess, SharedPostProcessInfo } from "./baseProcess";
import { aiScene } from "./scene";
import { IOSystem, DefaultIOSystem } from "./iosystem";
import { ProgressHandler, DefaultProgressHandler } from "./progressHandler";
import { GetImporterInstanceList } from "./importerRegistry";
import { GetPostProcessingStepInstanceList } from "./postStepRegistry";
import { SetGenericProperty, GetGenericProperty } from "./genericProperty";
import { uint32 } from "src/core/maths/uint32";
import { Logger } from "src/core/utils/log";
import { Profiler } from "./profiler";
import { File } from "../file";
import { aiPostProcessSteps } from "./postProcessing/postprocess";
import { ValidateDSProcess } from "./postProcessing/validateDataStructure";
import { ScenePreProcessor } from "./scenePreProcessor";

type KeyType = uint32;

class IntPropertyMap extends Map<KeyType, float> {}
class FloatPropertyMap extends Map<KeyType, float> {}
class StringPropertyMap extends Map<KeyType, string> {}
class MatrixPropertyMap extends Map<KeyType, Mat> {}

class ImporterPimpl {
    public ioHandler: Nullable<IOSystem> = null;
    public isDefaultHandler: boolean = false;

    public progressHandler: Nullable<ProgressHandler> = null;
    public isDefaultProgressHandler: boolean = false;

    public importer: Array<BaseImporter> = new Array<BaseImporter>();
    public postProcessingSteps: Array<BaseProcess> = new Array<BaseProcess>();

    public scene: Nullable<aiScene> = null;
    public errorString: string = '';

    public intProperties: IntPropertyMap = new IntPropertyMap();
    public floatProperties: FloatPropertyMap = new FloatPropertyMap();
    public stringProperties: StringPropertyMap = new StringPropertyMap();
    public matrixProperties: MatrixPropertyMap = new MatrixPropertyMap();

    public extraVerbose: boolean = false;

    public ppShared: Nullable<SharedPostProcessInfo> = null;

    constructor() {

    }
}

/** Main interface.
*
* Create an object of this class and call readFile() to import a file.
* If the import succeeds, the function returns a pointer to the imported data.
* The data remains property of the object, it is intended to be accessed
* read-only. The imported data will be destroyed along with the Importer
* object. If the import fails, readFile() returns null. In this
* case you can retrieve a human-readable error description be calling
* getErrorString(). You can call readFile() multiple times with a single Importer
* instance. Actually, constructing Importer objects involves quite many
* allocations and may take some time, so it's better to reuse them as often as
* possible.
*
* If you need the Importer to do custom file handling to access the files,
* implement IOSystem and IOStream and supply an instance of your custom
* IOSystem implementation by calling SetIOHandler() before calling ReadFile().
* If you do not assign a custion IO handler, a default handler using the
* standard C++ IO logic will be used.
*/
export class Importer {
    public static MaxLenHint: int = 200;

    public constructor() {
        this._impl = new ImporterPimpl();
        this._impl.scene = null;
        this._impl.errorString = '';

        this._impl.ioHandler = new DefaultIOSystem();
        this._impl.isDefaultHandler = true;
        this._impl.extraVerbose = false;

        this._impl.progressHandler = new DefaultProgressHandler();
        this._impl.isDefaultProgressHandler = true;

        GetImporterInstanceList(this._impl.importer);
        GetPostProcessingStepInstanceList(this._impl.postProcessingSteps);

        this._impl.ppShared = new SharedPostProcessInfo();
        for (let process of this._impl.postProcessingSteps) {
            process.setSharedData(this._impl.ppShared)
        }
    }

    public readFile(file: File, flags: int): Nullable<aiScene> {
        try {
            if (this._impl.scene) {
                Logger.debug('Deleting previous scene...');
                this.freeScene();
            }

            const profiler = new Profiler();
            profiler.beginRegion('total');

            let imp: Nullable<BaseImporter> = null;
            this.setPropertyInteger('importerIndex', -1);
            for (let a = 0; a < this._impl.importer.length; ++a) {
                if (this._impl.importer[a].canRead(file, this._impl.ioHandler!, false)) {
                    imp = this._impl.importer[a];
                    this.setPropertyInteger('importerIndex', a);
                    break;
                }
            }

            if (!imp) {
                Logger.debug('File extension not known, trying signature-based detection...');
                for (let a = 0; a < this._impl.importer.length; ++a) {
                    if (this._impl.importer[a].canRead(file, this._impl.ioHandler!, true)) {
                        imp = this._impl.importer[a];
                        this.setPropertyInteger('importerIndex', a);
                        break;
                    }
                }

                if (!imp) {
                    this._impl.errorString = `No suitable reader found for the file format of file '${file.name}'`;
                    Logger.error(this._impl.errorString);
                    return null;
                }
            }

            const desc: aiImporterDesc = imp.getInfo();
            const fileSize = file.size!;
            Logger.debug(`Found a matching importer for this file format: ${desc.name}.`);
            this._impl.progressHandler!.updateFileRead(0, fileSize);

            profiler.beginRegion('import');

            this._impl.scene = imp.readFile(this, file);
            this._impl.progressHandler!.updateFileRead(fileSize, fileSize);

            profiler.endRegion('import');

            this.setPropertyString('sourceFilePath', file.path);

            if (this._impl.scene) {
                if (flags & aiPostProcessSteps.ValidateDataStructure) {
                    let ds = new ValidateDSProcess();
                    ds.executeOnScene(this);
                    if (this._impl.scene === null)
                        return null;
                }

                profiler.beginRegion('preprocess');

                const preprocessor = new ScenePreProcessor(this._impl.scene);
                preprocessor.processScene();

                profiler.endRegion('preprocess');

                this.applyPostProcessing(flags & (~aiPostProcessSteps.ValidateDataStructure));
            }
            else if (!this._impl.scene) {
                this._impl.errorString = imp.getErrorText();
            }

            this._impl.ppShared!.clean();

            profiler.endRegion('total');

        }
        catch (err) {
            Logger.error('Erreur', err);
        }

        return this._impl.scene;
    }

    public applyPostProcessing(flags: int): Nullable<aiScene> {
        // TODO

        return this._impl.scene;
    }

    public freeScene(): void {
        this._impl.scene = null;
        this._impl.errorString = '';
    }

    public registerLoader(imp: BaseImporter): void {
        // TODO
    }

    public unregisterLoader(imp: BaseImporter): void {
        // TODO
    }

    public registerPPStep(imp: BaseProcess): void {
        // TODO
    }

    public unregisterPPStep(imp: BaseProcess): void {
        // TODO
    }

    public setPropertyInteger(name: string, iValue: int): boolean {
        return SetGenericProperty(this._impl.intProperties, name, iValue);
    }

    public setPropertyFloat(name: string, fValue: float): boolean {
        return SetGenericProperty(this._impl.floatProperties, name, fValue);
    }

    public setPropertyString(name: string, sValue: string): boolean {
        return SetGenericProperty(this._impl.stringProperties, name, sValue);
    }

    public setPropertyMatrix(name: string, mValue: Mat): boolean {
        return SetGenericProperty(this._impl.matrixProperties, name, mValue);
    }

    public getPropertyInteger(name: string): Nullable<int> {
        return GetGenericProperty(this._impl.intProperties, name);
    }

    public getPropertyFloat(name: string): Nullable<float> {
        return GetGenericProperty(this._impl.floatProperties, name);
    }

    public getPropertyString(name: string): Nullable<string> {
        return GetGenericProperty(this._impl.stringProperties, name);
    }

    public getPropertyMat(name: string): Nullable<Mat> {
        return GetGenericProperty(this._impl.matrixProperties, name);
    }

    public set progressHandler(handler: Nullable<ProgressHandler>) {
        if (!handler) {
            this._impl.progressHandler = new DefaultProgressHandler();
            this._impl.isDefaultProgressHandler = true;
        }
        else if (this._impl.ioHandler !== handler) {
            this._impl.ioHandler = handler;
            this._impl.isDefaultProgressHandler = false;
        }
    }

    public get progressHandler(): Nullable<ProgressHandler> {
        return this._impl.progressHandler;
    }

    public isDefaultProgressHandler(): boolean {
        return this._impl.isDefaultProgressHandler;
    }

    public set ioHandler(ioHandler: Nullable<IOSystem>) {
        if (!ioHandler) {
            this._impl.ioHandler = new DefaultIOSystem();
            this._impl.isDefaultHandler = true;
        }
        else if (this._impl.ioHandler !== ioHandler) {
            this._impl.ioHandler = ioHandler;
            this._impl.isDefaultHandler = false;
        }
    }

    public get ioHandler(): Nullable<IOSystem> {
        return this._impl.ioHandler;
    }

    public isDefaultIOHandler(): boolean {
        return this._impl.isDefaultHandler;
    }

    public get impl(): ImporterPimpl {
        return this._impl;
    }

    protected _impl: ImporterPimpl;

}