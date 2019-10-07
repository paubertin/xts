import { Vector, HashMap } from 'tstl';
import { int, Nullable, float } from 'src/core/utils/types';
import { Vec3, Mat } from 'src/core/maths';
import { aiPrimitiveType } from '../../mesh';
import { aiColor3D } from '../../color';

export namespace Obj {

    export class Face {
        primitiveType: aiPrimitiveType;
        vertices: Vector<int> = new Vector<int>();
        normals: Vector<int> = new Vector<int>();
        textureCoords: Vector<int> = new Vector<int>();
        material: Nullable<Material> = null;

        constructor(type: aiPrimitiveType = aiPrimitiveType.POLYGON) {
            this.primitiveType = type;
        }

        destroy(): void {}
    }

    export class Mesh {
        static NoMaterial: int = ~0;

        name: string;
        faces: Vector<Face> = new Vector<Face>();
        material: Nullable<Material> = null;
        numIndices: int = 0;
        uvCoordinates: Uint32Array = new Uint32Array(0x8);
        materialIndex: int = Mesh.NoMaterial;
        hasNormals: boolean = false;
        hasVertexColors: boolean = false;

        constructor(name: string) {
            this.name = name;
        }

        destroy(): void {
            for (let it = this.faces.begin(); !it.equals(this.faces.end()); it = it.next())
                it.value.destroy();
        }
    }

    type GroupMap = HashMap<string, Vector<int>>;
    type GroupMapIt = HashMap.Iterator<string, Vector<int>>;

    export class Model {
        modelName: string = '';
        objects: Vector<Object> = new Vector<Object>();
        current: Nullable<Object> = null;
        currentMaterial: Nullable<Material> = null;
        defaultMaterial: Nullable<Material> = null;
        materialLib: Vector<string> = new Vector<string>();
        vertices: Vector<Vec3> = new Vector<Vec3>();
        normals: Vector<Vec3> = new Vector<Vec3>();
        vertexColors: Vector<Vec3> = new Vector<Vec3>();
        groups: GroupMap = new HashMap<string, Vector<int>>();
        groupFaceIDs: Vector<int> = new Vector<int>();
        strActiveGroup: string = '';
        textureCoords: Vector<Vec3> = new Vector<Vec3>();
        textureCoordDim: int = 0;
        currentMesh: Nullable<Mesh> = null;
        meshes: Vector<Mesh> = new Vector<Mesh>();
        materialMap: HashMap<string, Material> = new HashMap<string, Material>();

        destroy(): void {
            for (let it = this.objects.begin(); !it.equals(this.objects.end()); it = it.next())
                it.value.destroy();
            this.objects.clear();

            for (let it = this.meshes.begin(); !it.equals(this.meshes.end()); it = it.next())
                it.value.destroy();
            this.meshes.clear();

            this.groups.clear();

            for (let it = this.materialMap.begin(); !it.equals(this.materialMap.end()); it = it.next())
                it.second.destroy();
        }
    }

    export class Object {
        name: string = '';
        transformation: Mat = Mat.Identity;
        subObjects: Vector<Object> = new Vector<Object>();
        meshes: Vector<int> = new Vector<int>();

        public destroy(): void {
            for (let it = this.subObjects.begin(); !it.equals(this.subObjects.end()); it = it.next())
                it.value.destroy();
        }
    }

    export enum TextureType {
        DiffuseType = 0,
        SpecularType,
        AmbientType,
        EmissiveType,
        BumpType,
        NormalType,
        ReflectionSphereType,
        ReflectionCubeTopType,
        ReflectionCubeBottomType,
        ReflectionCubeFrontType,
        ReflectionCubeBackType,
        ReflectionCubeLeftType,
        ReflectionCubeRightType,
        SpecularityType,
        OpacityType,
        DispType,
        Count
    };

    export class Material {
        name: string = '';

        texture: string = '';
        textureSpecular: string = '';
        textureAmbient: string = '';
        textureEmissive: string = '';
        textureBump: string = '';
        textureNormal: string = '';
        textureReflection: string = '';
        textureSpecularity: string = '';
        textureOpacity: string = '';
        textureDisp: string = '';

        ambient: aiColor3D = new aiColor3D();
        diffuse: aiColor3D = new aiColor3D(0.6, 0.6, 0.6);
        specular: aiColor3D = new aiColor3D();
        emissive: aiColor3D = new aiColor3D();
        alpha: float = 1.0;
        shineness: float = 0.0;
        illuminationModel: int = 1;
        ior: float = 1.0;
        transparent: aiColor3D = new aiColor3D(1.0, 1.0, 1.0);

        clamp: Array<boolean> = new Array<boolean>(TextureType.Count);

        constructor() {
            for (let i = 0; i < TextureType.Count; ++i)
                this.clamp[i] = false;
        }

        public destroy(): void {

        }
    }


}