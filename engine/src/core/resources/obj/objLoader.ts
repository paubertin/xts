import { int, Nullable } from "../../utils/types";
import { SceneNode } from '../../scene/sceneNode';
import { OBJ } from './utils';
import { Scene } from "src/core/scene/scene";
import { IMaterial } from "src/core/materials/material";
import { Logger } from "src/core/utils/log";
import { ALoader } from "../iAssetLoader";
import { IAssetManagerStatic } from "../assetManager";
import { IOfflineProvider } from "../offlineProvider";
import { File } from "../file";
import { Profiler } from "../assimp/profiler";

class LoadingManager {}

class FileLoader {
    private _manager: LoadingManager;

    public constructor(manager: LoadingManager) {
        this._manager = manager;
    }


}

export class ObjLoader extends ALoader {
    private _manager: LoadingManager = new LoadingManager();
    private _logging: boolean = true;
    private _modelName: string = '';
    private _instanceNum: int = 0;
    private _path: string = '';
    private _resourcePath: string = '';
    private _useIndices: boolean = false;
    private _disregardNormals: boolean = false;
    private _materialPerSmoothingGroup: boolean = false;
    private _useOAsMesh: boolean = false;
    private _rootNode: Nullable<SceneNode | Scene> = null;

    private _meshBuilder: OBJ.MeshBuilder = new OBJ.MeshBuilder();
    private _callbacks: OBJ.Callbacks = new OBJ.Callbacks();
    private _workerManager: OBJ.WorkerManager = new OBJ.WorkerManager();
    
    private _terminateWorkerOnLoad: boolean = true;

    constructor(assetManager: IAssetManagerStatic) {
        super(assetManager);
    }

    public get supportedExtensions(): string[] {
        return ['obj'];
    }

    public loadAsset(name: string, offlineProvider?: IOfflineProvider): void {
        const url = this._serverUrl + name;

        const noOfflineSupport = () => {
            throw new Error('Cannot load file. No internet connection.');
        };

        const loadFromOfflineSupport = () => {
            if (offlineProvider) {
                this.load(url, this._assetLoaded.bind(this), offlineProvider);
                // offlineProvider.loadFile(url, this.load.bind(this));
            }
        };

        if (offlineProvider) {
            offlineProvider.open(loadFromOfflineSupport, noOfflineSupport);
        }
        else {
            noOfflineSupport();
        }
    }

    private _assetLoaded(data: any): void {

    }

    public setLogging(enabled: boolean): void {
        this._logging = enabled === true;
        this._meshBuilder.setLogging(enabled);
    }

    public set modelName(name: Nullable<string>) {
        this._modelName = OBJ.Utils.defaults(name, this._modelName);
    }

    public set path(url: Nullable<string>) {
        this._path = OBJ.Utils.defaults(url, this._path);
    }

    public set resourcePath(path: Nullable<string>) {
        this._resourcePath = OBJ.Utils.defaults(path, this._resourcePath);
    }

    public set rootNode(nodeOrScene: SceneNode | Scene) {
        this._rootNode = OBJ.Utils.defaults(nodeOrScene, this._rootNode);
    }

    public set materials(materials: Map<string, IMaterial>) {
        this._meshBuilder.materials = materials;
    }

    public useIndices(useIndices: boolean) {
        this._useIndices = useIndices === true;
    }

    public disregardNormals(disregardNormals: boolean) {
        this._disregardNormals = disregardNormals === true;
    }

    public materialPerSmoothingGroup(materialPerSmoothingGroup: boolean) {
        this._materialPerSmoothingGroup = materialPerSmoothingGroup === true;
    }

    public useOAsMesh(useOAsMesh: boolean) {
        this._useOAsMesh = useOAsMesh === true;
    }

    private _onProgress(type: string, text: string, numericalValue: number): void {
        const event = {
            detail: {
                type,
                modelName: this._modelName,
                instanceNum: this._instanceNum,
                text: OBJ.Utils.isValid(text) ? text : '',
                numericalValue,
            },
        };
        if (OBJ.Utils.isValid(this._callbacks.onProgress))
            this._callbacks.onProgress(event);

        if (this._logging)
            Logger.debug(event.detail.text);
    }

    private _onError(msg: string | ProgressEvent): void {
        if (this._logging)
            Logger.debug(msg);

        if (OBJ.Utils.isValid(this._callbacks.onError))
            this._callbacks.onError(msg);
        else
            throw msg;
    }

    private _setCallbacks(callbacks: OBJ.Callbacks): void {
        if (OBJ.Utils.isValid(callbacks.onError)) this._callbacks.onError = callbacks.onError;
        if (OBJ.Utils.isValid(callbacks.onLoad)) this._callbacks.onLoad = callbacks.onLoad;
        if (OBJ.Utils.isValid(callbacks.onLoadMaterials)) this._callbacks.onLoadMaterials = callbacks.onLoadMaterials;
        if (OBJ.Utils.isValid(callbacks.onMeshAlter)) this._callbacks.onMeshAlter = callbacks.onMeshAlter;
        if (OBJ.Utils.isValid(callbacks.onProgress)) this._callbacks.onProgress = callbacks.onProgress;

        this._meshBuilder.setCallbacks(callbacks);
    }

    public load(url: string, onLoad: (data: any) => void, offlineProvider: IOfflineProvider, onProgress?: (event: ProgressEvent) => void,
        onError?: (event: string | ProgressEvent) => void, onMeshAlter?: () => void, loadAsync: boolean = true): void {
        const resource = new OBJ.Resource(url, 'obj');
        this._loadObj(resource, onLoad, offlineProvider, onProgress, onError, onMeshAlter, loadAsync);
    }

    private _loadObj(resource: OBJ.Resource, onLoad: (data: any) => void, offlineProvider: IOfflineProvider,
        onProgress?: (this: XMLHttpRequestEventTarget, ev: ProgressEvent) => any,
        onError?: (event: string | ProgressEvent) => void, onMeshAlter?: () => void, loadAsync: boolean = true): void {
        if (!OBJ.Utils.isValid(onError)) {
            onError = (event: string | ProgressEvent) => {
                let msg: string | ProgressEvent = event;
                if (event instanceof ProgressEvent) {
                    if (event.currentTarget && (event.currentTarget as any).statusText !== null) {
                        msg = 'Error occurred while downloading!\nurl: '
                            + (event.currentTarget as any).responseURL + '\nstatus: '
                            + (event.currentTarget as any).statusText;
                    }
                }
                this._onError(msg);
            };
        }

        if (!OBJ.Utils.isValid(resource) && onError)
            onError('An invalid ResourceDescriptor was provided. Unable to continue!');

        const fileLoaderOnLoad = (file: File | undefined) => {
            debugger;
            if (file) {
                resource.content = file.content;
                if (loadAsync) {
                this.parseAsync(file.content, onLoad);
                }
                else {
                    const callbacks = new OBJ.Callbacks();
                    callbacks.onMeshAlter = onMeshAlter;
                    this._setCallbacks(callbacks);
                    onLoad({
                        detail: {
                            rootNode: this.parse(file.content),
                            modelName: this._modelName,
                            instanceNum: this._instanceNum,
                        },
                    });
                }
            }
        };
        this.path = resource.path;
        this.resourcePath = resource.resourcePath;

        if (!OBJ.Utils.isValid(resource.url)) {
            // fileLoaderOnLoad(OBJ.Utils.isValid(resource.content) ? resource.content : null);
        }
        else {
            if (!OBJ.Utils.isValid(onProgress)) {
                let numericalValueRef = 0;
                let numericalValue = 0;
                onProgress = (event: ProgressEvent) => {
                    if (!event.lengthComputable)
                        return;
                    numericalValue = event.loaded / event.total;
                    if (numericalValue > numericalValueRef) {
                        numericalValueRef = numericalValue;
                        const output = 'Download of "' + resource.url + '": ' + ( numericalValue * 100 ).toFixed( 2 ) + '%';
                        this._onProgress('progressLoad', output, numericalValue);
                    }
                }
            }
            offlineProvider.loadFile(resource.url, fileLoaderOnLoad, onProgress, onError);
            // let fileLoader = new FileLoader(this._manager);
            // fileLoader.path = this._path || this._resourcePath;
            // fileLoader.responseType = 'arraybuffer';
            // fileLoader.load(resource.name, fileLoaderOnLoad, onProgress, onError);
        }
    }

    public parse(content: Nullable<string | ArrayBuffer>): void {
        // TODO
    }

    public parseAsync(content: Nullable<string | ArrayBuffer>, onLoad: (data: any) => void): void {
        debugger;
        let measureTime: boolean = false;
        const profiler = new Profiler();
        const _onLoad = () => {
            onLoad({
                detail: {
                    rootNode: this._rootNode,
                    modelName: this._modelName,
                    instanceNum: this._instanceNum,
                },
            });
            if (measureTime && this._logging)
                profiler.endRegion('ObjLoader ParseAsync ' + this._modelName);
        };
        Logger.assert(OBJ.Utils.isValid(content), 'Provided content is not a valid ArrayBuffer or String. Unable to continue parsing');

        measureTime = true;
        if (measureTime && this._logging)
            profiler.beginRegion('ObjLoader ParseAsync ' + this._modelName);
        
        this._meshBuilder.init();

        const _onMeshLoaded = (payload: OBJ.IPayload) => {
            const meshes = this._meshBuilder.processPayload(payload);
            if (!meshes) return;
            for (let mesh of meshes) {
                if (this._rootNode instanceof SceneNode)
                    this._rootNode.addChild(mesh);
                else if (this._rootNode instanceof Scene)
                    this._rootNode.add(mesh);
            }
        };

        const buildCode = (codeSerializer: OBJ.ICodeSerializer) => {
            let workerCode = '';
            workerCode += 'THREE = { LoaderSupport: {}, OBJLoader2: {} };\n\n';
            workerCode += codeSerializer.serializeClass('ObjParser', ObjParser);

            return workerCode;
        };

        this._workerManager.validate(buildCode, 'ObjParser' );
        this._workerManager.setCallbacks(_onMeshLoaded, _onLoad);
        if ( this._terminateWorkerOnLoad ) this._workerManager.terminateRequested = true;

        debugger;
        let materialNames: any = {};
        let materials = this._meshBuilder.materials;
        for (let mat of materials) {
            materialNames[mat[0]] = mat[1];
        }
        const payload: OBJ.IWorkerPayload = {
            params: {
                useAsync: true,
                materialPerSmoothingGroup: this._materialPerSmoothingGroup,
                useOAsMesh: this._useOAsMesh,
                useIndices: this._useIndices,
                disregardNormals: this._disregardNormals
            },
            logging: this._logging,
            materials: {
                // in async case only material names are supplied to parser
                materials: materialNames
            },
            data: {
                input: content,
                options: null
            }
        };
        this._workerManager.run(payload);
    }

}


class ObjParser {
        
}
