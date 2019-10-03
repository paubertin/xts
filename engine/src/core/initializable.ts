import { Logger } from "./utils/log";

interface MethodDecorator {
    (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
}

export abstract class Initializable {
    private _initialized: boolean = false;

    protected static readonly assertInitializedFalse = (object: Initializable) => Logger.assert(false, `instance of ${object.constructor.name} expected to be initialized`);
    protected static readonly assertUninitializedFalse = (object: Initializable) => Logger.assert(false, `instance of ${object.constructor.name} expected to be uninitialized`);

    protected static initialize(): MethodDecorator {
        return (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
            const initialize = descriptor.value;
            (descriptor as any).value = function(): boolean {
                Logger.assert(this._initialized === false, `re-initialization of initialized object not anticipated`);
                this._initialized = initialize.apply(this, arguments);
                if (this._initialized) {
                    this.assertInitialized = () => undefined;
                    this.assertUninitialized = () => Initializable.assertUninitializedFalse(this);
                }
                else {
                    this.assertInitialized = () => Initializable.assertInitializedFalse(this);
                    this.assertUninitialized = () => undefined;
                }
                return this._initialized;
            };
            return descriptor;
        };
    }

    protected static uninitialize(): MethodDecorator {
        return (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
            const uninitialize = descriptor.value;
            (descriptor as any).value = function(): void {
                Logger.assert(this._initialized === true, `expected object to be initialized in order to uninitialize`);
                uninitialize.apply(this);
                this._initialized = false;
                this.assertInitialized = () => Initializable.assertInitializedFalse(this);
                this.assertUninitialized = () => undefined;
            };
            return descriptor;
        };
    }

    protected assertInitialized: () => void = () => Initializable.assertInitializedFalse(this);
    protected assertUninitialized: () => void = () => undefined;

    protected abstract initialize(...args: any[]): boolean;
    protected abstract uninitialize(): void;

    public get initialized(): boolean {
        return this._initialized;
    }
}