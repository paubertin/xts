import { Nullable } from "../utils/types";
import { Logger } from "../utils/log";

export interface IOfflineProvider {
    open(successCallback: () => void, errorCallback: () => void): void;
    loadImage(url: string, image: HTMLImageElement): void;
    loadShader(url: string, name: string, shaderLoaded: (name: string, source: string) => void): void;
}

export class DataBase implements IOfflineProvider {

    private _db: Nullable<IDBDatabase> = null;
    private _hasReachedQuota: boolean = false;

    private _idbFactory: IDBFactory = window.indexedDB;

    private _isSupported!: boolean;
    private _mustUpdateResources: boolean = false;

    public open(successCallback: () => void, errorCallback: () => void): void {
        const handleError = () => {
            this._isSupported = false;
            errorCallback();
        };

        if (!this._idbFactory) {
            this._isSupported = false;
            errorCallback();
        }
        else {
            if (this._db === null) {
                this._isSupported = true;

                let request: IDBOpenDBRequest = this._idbFactory.open('xts');

                request.onerror = () => {
                    handleError();
                };

                request.onblocked = () => {
                    Logger.error('IDB request blocked. Please reload the page.');
                    handleError();
                };

                request.onsuccess = () => {
                    this._db = request.result;
                    successCallback();
                };

                request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                    this._db = (<any>(event.target)).result;
                    if (this._db) {
                        try {
                            this._db.createObjectStore('textures', { keyPath: 'textureUrl'});
                            this._db.createObjectStore('shaders', { keyPath: 'shaderUrl'});
                        }
                        catch (err) {
                            Logger.error('Error while creating object stores. Exception: ', err.message);
                            handleError();
                        }
                    }
                };
            }
            else {
                successCallback();
            }
        }
    }

    public loadShader(url: string, name: string, shaderLoaded: (name: string, source: string) => void): void {
        const completeUrl = DataBase.GetFullUrlLocation(url);

        const saveAndLoadShader = () => {
            if (!this._hasReachedQuota && this._db !== null) {
                this._saveShaderIntoDb(completeUrl, name, shaderLoaded);
            }
            else {
                Logger.error('Could not save shader into DB...');
            }
        };

        if (!this._mustUpdateResources) {
            this._loadShaderFromDb(completeUrl, name, shaderLoaded, saveAndLoadShader);
        }
        else {
            saveAndLoadShader();
        }
    }

    private _saveShaderIntoDb(url: string, name: string, shaderLoaded: (name: string, source: string) => void): void {
        let shaderSource: string;
        if (this._isSupported) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.addEventListener('load', () => {
                if (xhr.status === 200 && this._db) {
                    shaderLoaded(name, xhr.response);
                }
            }, false);
            xhr.addEventListener('load', () => {
                if (xhr.status === 200 && this._db) {
                    shaderSource = xhr.response;
                    let transaction = this._db.transaction(['shaders'], 'readwrite');

                    transaction.onabort = (event: Event) => {
                        try {
                            let srcElement = <any>(event.srcElement || event.target);
                            let error = srcElement.error;
                            if (error && error.name === 'QuotaExceededError') {
                                this._hasReachedQuota = true;
                            }
                        }
                        catch (err) {}
                        shaderLoaded(name, shaderSource);
                    };

                    transaction.oncomplete = () => {
                        shaderLoaded(name, shaderSource);
                    };

                    let newShader = { shaderUrl: url, data: shaderSource};

                    try {
                        let addRequest = transaction.objectStore('shaders').put(newShader);
                        addRequest.onsuccess = () => {};
                        addRequest.onerror = () => {
                            shaderLoaded(name, shaderSource);
                        };
                    }
                    catch (err) {
                        Logger.error(`Could not inject shader into IndexedDB: ${err}`);
                        console.log(err);
                    }
                }
                else {
                    Logger.error('Error in XHR Request in XTS Database.');
                }
            }, false);

            xhr.addEventListener('error', () => {
                Logger.error('Error in XHR Request in XTS Database.');
            }, false);

            xhr.send();
        }
        else {
            Logger.error(`IndexedDB not supported.`);
        }
    }

    private _loadShaderFromDb(url: string, name: string, shaderLoaded: (name: string, source: string) => void, notInDbCallback: () => any): void {
        if (this._isSupported && this._db !== null) {
            let shader: any;
            const transaction: IDBTransaction = this._db.transaction(['shaders']);

            transaction.onabort = () => {
                
            };

            transaction.oncomplete = () => {
                let shaderUrl: string;
                if (shader) {
                    shaderUrl = shader.data;
                    shaderLoaded(name, shader.data);
                }
                else {
                    notInDbCallback();
                }
            };

            const getRequest: IDBRequest = transaction.objectStore('shaders').get(url);

            getRequest.onsuccess = (event: Event) => {
                shader = (<any>(event.target)).result;
            };
            getRequest.onerror = () => {
                Logger.error(`Error loading shader ${url} from DB.`);
            };
        }
        else {
            Logger.error(`IndexedDB not supported.`);
        }
    }

    public loadImage(url: string, image: HTMLImageElement): void {
        const completeUrl = DataBase.GetFullUrlLocation(url);

        const saveAndLoadImage = () => {
            if (!this._hasReachedQuota && this._db !== null) {
                this._saveImageIntoDb(completeUrl, image);
            }
            else {
                image.src = url;
            }
        };

        if (!this._mustUpdateResources) {
            this._loadImageFromDb(completeUrl, image, saveAndLoadImage);
        }
        else {
            saveAndLoadImage();
        }
    }

    private _loadImageFromDb(url: string, image: HTMLImageElement, notInDbCallback: () => any): void {
        if (this._isSupported && this._db !== null) {
            let texture: any;
            const transaction: IDBTransaction = this._db.transaction(['textures']);

            transaction.onabort = () => {
                image.src = url;
            };

            transaction.oncomplete = () => {
                let blobTextureUrl: string;
                if (texture) {
                    blobTextureUrl = URL.createObjectURL(texture.data);
                    image.onerror = () => {
                        Logger.error(`Error while loading image from blob url: ${blobTextureUrl}. Switching back to web url: ${url}.`);
                        image.src = url;
                    };
                    image.src = blobTextureUrl;
                }
                else {
                    notInDbCallback();
                }
            };

            const getRequest: IDBRequest = transaction.objectStore('textures').get(url);

            getRequest.onsuccess = (event: Event) => {
                texture = (<any>(event.target)).result;
            };
            getRequest.onerror = () => {
                Logger.error(`Error loading image ${url} from DB.`);
                image.src = url;
            };
        }
        else {
            Logger.error(`IndexedDB not supported.`);
            image.src = url;
        }
    }

    private _saveImageIntoDb(url: string, image: HTMLImageElement): void {
        if (this._isSupported) {
            let blob: Blob;

            const generateBlobUrl = () => {
                let blobTextureUrl: Nullable<string> = null;

                if (blob) {
                    try {
                        blobTextureUrl = URL.createObjectURL(blob);
                    }
                    catch (err) {
                        blobTextureUrl = URL.createObjectURL(blob);
                    }
                }

                if (blobTextureUrl) {
                    image.src = blobTextureUrl;
                }
            };

            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.addEventListener('load', () => {
                if (xhr.status === 200 && this._db) {
                    blob = xhr.response;
                    let transaction = this._db.transaction(['textures'], 'readwrite');

                    transaction.onabort = (event: Event) => {
                        try {
                            let srcElement = <any>(event.srcElement || event.target);
                            let error = srcElement.error;
                            if (error && error.name === 'QuotaExceededError') {
                                this._hasReachedQuota = true;
                            }
                        }
                        catch (err) {}
                        generateBlobUrl();
                    };

                    transaction.oncomplete = () => {
                        generateBlobUrl();
                    };

                    let newTexture = { textureUrl: url, data: blob};

                    try {
                        let addRequest = transaction.objectStore('textures').put(newTexture);
                        addRequest.onsuccess = () => {};
                        addRequest.onerror = () => {
                            generateBlobUrl();
                        };
                    }
                    catch (err) {
                        if (err.code === 25) {
                            Logger.error(`Could not inject blob into IndexedDB.`);
                        }
                        Logger.error(`Could not inject blob into IndexedDB: ${err}`);
                        console.log(err);
                        image.src = url;
                    }
                }
                else {
                    image.src = url;
                }
            }, false);

            xhr.addEventListener('error', () => {
                Logger.error('Error in XHR Request in XTS Database.');
                image.src = url;
            }, false);

            xhr.send();
        }
        else {
            Logger.error(`IndexedDB not supported.`);
            image.src = url;
        }
    }

    private static ParseURL(url: string) {
        var a = document.createElement('a');
        a.href = url;
        var urlWithoutHash = url.substring(0, url.lastIndexOf('#'));
        var fileName = url.substring(urlWithoutHash.lastIndexOf('/') + 1, url.length);
        var absLocation = url.substring(0, url.indexOf(fileName, 0));
        return absLocation;
    }

    private static GetFullUrlLocation(url: string): string {
        if (url.indexOf('http:/') === -1 && url.indexOf('https:/') === -1) {
            return (DataBase.ParseURL(window.location.href) + url);
        }
        else {
            return url;
        }
    }
}