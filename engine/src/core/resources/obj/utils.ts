import { Nullable, UNullable } from '../../utils/types';
import { Logger } from 'src/core/utils/log';
import { MaterialLoader } from 'src/core/materials/materialLoader';
import { IMaterial, Material } from 'src/core/materials/material';
import { Mesh } from 'src/core/mesh/mesh';
import { SceneNode } from 'src/core/scene/sceneNode';
import { BrowserWorker } from './browserWorker';
import { Profiler } from '../assimp/profiler';

export namespace OBJ {

    export namespace Utils {

        export function isValid(input: any): boolean {
            return input !== null && input !== undefined;
        }

        export function defaults<T>(input: UNullable<T>, defaultValue: T): T {
            return isValid(input) ? input! : defaultValue;
        }

    }

    export class Resource {
        private _path: Nullable<string> = null;
        private _resourcePath: Nullable<string> = null;
        private _name: string;
        private _url: string;
        private _extension: string;
        private _content: Nullable<string | ArrayBuffer> = null;

        public constructor(url: string, extension: string) {
            this._url = url;
            this._name = url;
            const urlParts = url.split('/');
            if (urlParts.length > 1) {
                this._path = Utils.defaults(urlParts.slice(0, urlParts.length - 1).join('/') + '/', this._path);
                this._name = urlParts[urlParts.length - 1];
            }
            this._name = Utils.defaults(this._name, 'UnnamedResource');
            this._extension = Utils.defaults(extension, 'default');
        }

        public set content(content: Nullable<string | ArrayBuffer>) {
            this._content = Utils.defaults(content, this._content);
        }

        public get content(): Nullable<string | ArrayBuffer> {
            return this._content;
        }

        public set resourcePath(resourcePath: Nullable<string>) {
            this._resourcePath = Utils.defaults(resourcePath, this._resourcePath);
        }

        public get path(): Nullable<string> {
            return this._path;
        }

        public get resourcePath(): Nullable<string> {
            return this._resourcePath;
        }

        public get name(): string {
            return this._name;
        }

        public get url(): string {
            return this._url;
        }
    }

    export interface IWorkerPayload {
        params: {
            useAsync: boolean;
            materialPerSmoothingGroup: boolean;
            useOAsMesh: boolean;
            useIndices: boolean;
            disregardNormals: boolean;
        },
        logging: boolean;
        materials: {
            // in async case only material names are supplied to parser
            materials: string[];
        },
        data: {
            input: Nullable<string | ArrayBuffer>;
            options: any;
        }
    }

    export interface IPayload {
        cmd: string;
    }

    export interface IMaterialPayload extends IPayload {
        materials: {
            materialCloneInstructions: Nullable<{
                materialNameOrg: string;
                materialName: string;
                materialProperties: any;
            }>;
            serializedMaterials: Nullable<any>;
            runtimeMaterials: Nullable<IMaterial[]>;
        };
    }

    export interface IMeshPayload extends IPayload {

    }

    export class Callbacks {
        private _onProgress: Nullable<(event: ProgressEvent) => void> = null;
        private _onError: Nullable<(msg: string | ProgressEvent) => void> = null;
        private _onLoad: Nullable<(data: any) => void> = null;
        private _onLoadMaterials: Nullable<any> = null;
        private _onMeshAlter: Nullable<any> = null;

        public constructor() {}

        public set onProgress(cb: any) {
            this._onProgress = Utils.defaults(cb, this._onProgress);
        }

        public set onError(cb: (msg: string | ProgressEvent) => void) {
            this._onError = Utils.defaults(cb, this._onError);
        }

        public set onLoad(cb: any) {
            this._onLoad = Utils.defaults(cb, this._onLoad);
        }

        public set onLoadMaterials(cb: any) {
            this._onLoadMaterials = Utils.defaults(cb, this._onLoadMaterials);
        }

        public set onMeshAlter(cb: any) {
            this._onMeshAlter = Utils.defaults(cb, this._onMeshAlter);
        }
    }

    export class MeshBuilder {
        private _logging: boolean = true;

        private _callbacks: Callbacks = new Callbacks();

        private _materials: Map<string, IMaterial> = new Map<string, IMaterial>();

        public setLogging(enabled: boolean): void {
            this._logging = enabled === true;
        }

        public get materials(): Map<string, IMaterial> {
            return this._materials;
        }

        public set materials(materials: Map<string, IMaterial>) {
            const payload: IMaterialPayload = {
                cmd: 'materialData',
                materials: {
                    materialCloneInstructions: null,
                    serializedMaterials: null,
                    runtimeMaterials: Utils.isValid(this._callbacks.onLoadMaterials)
                        ? this._callbacks.onLoadMaterials(materials)
                        : materials,
                },
            };

            this.updateMaterials(payload);
        }

        public setCallbacks(callbacks: OBJ.Callbacks): void {
            if (OBJ.Utils.isValid(callbacks.onError)) this._callbacks.onError = callbacks.onError;
            if (OBJ.Utils.isValid(callbacks.onLoad)) this._callbacks.onLoad = callbacks.onLoad;
            if (OBJ.Utils.isValid(callbacks.onLoadMaterials)) this._callbacks.onLoadMaterials = callbacks.onLoadMaterials;
            if (OBJ.Utils.isValid(callbacks.onMeshAlter)) this._callbacks.onMeshAlter = callbacks.onMeshAlter;
            if (OBJ.Utils.isValid(callbacks.onProgress)) this._callbacks.onProgress = callbacks.onProgress;
        }

        public init(): void {
            var defaultMaterial = new Material();
            defaultMaterial.name = 'defaultMaterial';

            var defaultVertexColorMaterial = new Material();
            defaultVertexColorMaterial.name = 'defaultVertexColorMaterial';
            defaultVertexColorMaterial.vertexColors = 2;

            var defaultLineMaterial = new Material();
            defaultLineMaterial.name = 'defaultLineMaterial';

            var defaultPointMaterial = new Material();
            defaultPointMaterial.name = 'defaultPointMaterial';

            var runtimeMaterials: IMaterial[] = [
                defaultMaterial,
                defaultVertexColorMaterial,
                defaultLineMaterial,
                defaultPointMaterial,
            ];

            this.updateMaterials(
                {
                    cmd: 'materialData',
                    materials: {
                        materialCloneInstructions: null,
                        serializedMaterials: null,
                        runtimeMaterials: runtimeMaterials
                    }
                }
            );
        }

        public processPayload(payload: IPayload): Nullable<SceneNode[]> {
            if ( payload.cmd === 'meshData' ) {
                return this._buildMeshes(payload as IMeshPayload);
            } else if ( payload.cmd === 'materialData' ) {
                this.updateMaterials(payload as IMaterialPayload);
                return null;
            }
            return null;
        }

        private _buildMeshes(meshPayload: IMeshPayload): SceneNode[] {
            Logger.warn('Missing implementation: MeshBuilder._buildMeshes', __dirname, __filename);
            return [];
            /*
            var meshName = meshPayload.params.meshName;

            var bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.vertices ), 3 ) );
            if ( this.validator.isValid( meshPayload.buffers.indices ) ) {

                bufferGeometry.setIndex( new THREE.BufferAttribute( new Uint32Array( meshPayload.buffers.indices ), 1 ));

            }
            var haveVertexColors = this.validator.isValid( meshPayload.buffers.colors );
            if ( haveVertexColors ) {

                bufferGeometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.colors ), 3 ) );

            }
            if ( this.validator.isValid( meshPayload.buffers.normals ) ) {

                bufferGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.normals ), 3 ) );

            } else {

                bufferGeometry.computeVertexNormals();

            }
            if ( this.validator.isValid( meshPayload.buffers.uvs ) ) {

                bufferGeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.uvs ), 2 ) );

            }

            var material, materialName, key;
            var materialNames = meshPayload.materials.materialNames;
            var createMultiMaterial = meshPayload.materials.multiMaterial;
            var multiMaterials = [];
            for ( key in materialNames ) {

                materialName = materialNames[ key ];
                material = this.materials[ materialName ];
                if ( createMultiMaterial ) multiMaterials.push( material );

            }
            if ( createMultiMaterial ) {

                material = multiMaterials;
                var materialGroups = meshPayload.materials.materialGroups;
                var materialGroup;
                for ( key in materialGroups ) {

                    materialGroup = materialGroups[ key ];
                    bufferGeometry.addGroup( materialGroup.start, materialGroup.count, materialGroup.index );

                }

            }

            var meshes = [];
            var mesh;
            var callbackOnMeshAlter = this.callbacks.onMeshAlter;
            var callbackOnMeshAlterResult;
            var useOrgMesh = true;
            var geometryType = this.validator.verifyInput( meshPayload.geometryType, 0 );
            if ( this.validator.isValid( callbackOnMeshAlter ) ) {

                callbackOnMeshAlterResult = callbackOnMeshAlter(
                    {
                        detail: {
                            meshName: meshName,
                            bufferGeometry: bufferGeometry,
                            material: material,
                            geometryType: geometryType
                        }
                    }
                );
                if ( this.validator.isValid( callbackOnMeshAlterResult ) ) {

                    if ( callbackOnMeshAlterResult.isDisregardMesh() ) {

                        useOrgMesh = false;

                    } else if ( callbackOnMeshAlterResult.providesAlteredMeshes() ) {

                        for ( var i in callbackOnMeshAlterResult.meshes ) {

                            meshes.push( callbackOnMeshAlterResult.meshes[ i ] );

                        }
                        useOrgMesh = false;

                    }

                }

            }
            if ( useOrgMesh ) {

                if ( meshPayload.computeBoundingSphere ) bufferGeometry.computeBoundingSphere();
                if ( geometryType === 0 ) {

                    mesh = new THREE.Mesh( bufferGeometry, material );

                } else if ( geometryType === 1) {

                    mesh = new THREE.LineSegments( bufferGeometry, material );

                } else {

                    mesh = new THREE.Points( bufferGeometry, material );

                }
                mesh.name = meshName;
                meshes.push( mesh );

            }

            var progressMessage;
            if ( this.validator.isValid( meshes ) && meshes.length > 0 ) {

                var meshNames = [];
                for ( var i in meshes ) {

                    mesh = meshes[ i ];
                    meshNames[ i ] = mesh.name;

                }
                progressMessage = 'Adding mesh(es) (' + meshNames.length + ': ' + meshNames + ') from input mesh: ' + meshName;
                progressMessage += ' (' + ( meshPayload.progress.numericalValue * 100 ).toFixed( 2 ) + '%)';

            } else {

                progressMessage = 'Not adding mesh: ' + meshName;
                progressMessage += ' (' + ( meshPayload.progress.numericalValue * 100 ).toFixed( 2 ) + '%)';

            }
            var callbackOnProgress = this.callbacks.onProgress;
            if ( this.validator.isValid( callbackOnProgress ) ) {

                var event = new CustomEvent( 'MeshBuilderEvent', {
                    detail: {
                        type: 'progress',
                        modelName: meshPayload.params.meshName,
                        text: progressMessage,
                        numericalValue: meshPayload.progress.numericalValue
                    }
                } );
                callbackOnProgress( event );

            }

            return meshes;
            */
        }

        public updateMaterials(payload: IMaterialPayload): void {
            const cloneInstructions = payload.materials.materialCloneInstructions;
            if (Utils.isValid(cloneInstructions)) {
                const materialNameOrg = cloneInstructions!.materialNameOrg;
                const materialOrg = this._materials.get(materialNameOrg);

                if (Utils.isValid(materialOrg)) {
                    const material = materialOrg!.clone();
                    const materialName = cloneInstructions!.materialName;
                    material.name = materialName;

                    const materialProperties = cloneInstructions!.materialProperties;

                    for (const key in materialProperties) {
                        if (material.hasOwnProperty(key) && materialProperties.hasOwnProperty(key))
                            (<any>material)[key] = materialProperties[key];
                    }
                    this._materials.set(materialName, material);
                }
                else {
                    Logger.warn(`Requested material '${materialNameOrg}' is not available.`);
                }
            }

            const serializedMaterials = payload.materials.serializedMaterials;
            if (Utils.isValid(serializedMaterials) && Object.keys(serializedMaterials).length > 0) {
                const loader = new MaterialLoader();
                for (const name in serializedMaterials) {
                    const json = serializedMaterials[name];
                    if (Utils.isValid(json)) {
                        const material = loader.parse(json);
                        if (this._logging)
                            Logger.info(`De-serialized material with name '${name}' will be added.`);
                        this._materials.set(name, material);
                    }
                }
            }

            const runtimeMaterials = payload.materials.runtimeMaterials;
            if (Utils.isValid(runtimeMaterials) && runtimeMaterials!.length > 0) {
                for (const runtimeMaterial of runtimeMaterials!) {
                    if (this._logging)
                        Logger.info(`Material with name '${runtimeMaterial.name}' will be added.`);
                    this._materials.set(runtimeMaterial.name, runtimeMaterial);
                }
            }
        }
    }

    export class WorkerManager {
        private _logging: boolean = true;
        private _worker: BrowserWorker = new BrowserWorker();

        constructor() {}

        public validate(functionCodeBuilder: Function, parserName: string,
            libLocations?: string[], libPath?: string, runnerImpl?: BrowserWorkerRunnerRefImpl | NodeWorkerRunnerRefImpl): void {
            if (Utils.isValid(this._worker.worker)) return;

            const profiler = new Profiler();
            if (this._logging) {
                Logger.info('Building worker code...');
                profiler.beginRegion('buildWorkerCode');
            }

            if (runnerImpl) {
                if (this._logging)
                    Logger.info('WorkerSupport: Using "' + runnerImpl.runnerName + '" as Runner class for worker.');
            }
            else if (typeof window !== undefined) {
                runnerImpl = BrowserWorkerRunnerRefImpl;
            }
            else {
                runnerImpl = NodeWorkerRunnerRefImpl;
            }

            let userCode = functionCodeBuilder(CodeSerializer);
            userCode += 'let parser = ' + parserName + ';\n\n';
            userCode += CodeSerializer.serializeClass(runnerImpl.runnerName, runnerImpl);
            userCode += 'new ' + runnerImpl.runnerName + '();\n\n';

            console.log('runnerImpl', runnerImpl);

            if (libLocations && libLocations.length > 0) {
                // TODO !
            }
            else {
                this._worker.initWorker(userCode, runnerImpl.runnerName);
                if (this._logging) {
                    profiler.endRegion('buildWorkerCode');
                }
            }
        }

        public setCallbacks(meshBuilder: Function, onLoad: Function): void {
            this._worker.setCallbacks(meshBuilder, onLoad);
        }

        public set terminateRequested(terminateRequested: boolean) {
            this._worker.terminateRequested = terminateRequested;
        }

        public run(payload: IWorkerPayload): void {
            // TODO
        }
    }

    abstract class WorkerRunnerRefImpl {
        public abstract get runnerName(): string;
    }

    class BrowserWorkerRunnerRefImpl extends WorkerRunnerRefImpl {
        public static runnerName: string = 'BrowserWorkerRunnerRefImpl';
    
        constructor() {
            super();
        }

        public get runnerName(): string {
            return BrowserWorkerRunnerRefImpl.runnerName;
        }
    }

    class NodeWorkerRunnerRefImpl extends WorkerRunnerRefImpl {
        public static runnerName: string = 'NodeWorkerRunnerRefImpl';

        constructor() {
            super();
        }

        public get runnerName(): string {
            return NodeWorkerRunnerRefImpl.runnerName;
        }
    }

    export interface ICodeSerializer {
        serializeClass: (fullName: string, object: any, ctorName?: string) => string;
    }

    const CodeSerializer: ICodeSerializer = {
        serializeClass: (fullName: string, object: any, ctorName?: string): string => {
            console.log('fullName', fullName);
            console.log('object', object);
            console.log('ctorName', ctorName);
            return object.toString();
        },
    }
}