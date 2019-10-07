import { Mat } from '../../maths';
import { Nullable, int } from '../../utils/types';
import { aiMesh } from './mesh';
import { aiMetadata } from './metadata';
import { aiMaterial } from './material';
import { aiTexture } from './texture';
import { aiAnimation } from './animation';
import { aiLight } from './light';
import { aiCamera } from './camera';
import { Importer } from './importer';

/** 
 * A node in the imported hierarchy.
 *
 * Each node has name, a parent node (except for the root node),
 * a transformation relative to its parent and possibly several child nodes.
 * Simple file formats don't support hierarchical structures - for these formats
 * the imported scene does consist of only a single root node without children.
 */
export class aiNode {
    /** The name of the node.
     *
     * The name might be empty (length of zero) but all nodes which
     * need to be referenced by either bones or animations are named.
     * Multiple nodes may have the same name, except for nodes which are referenced
     * by bones (see #aiBone and #aiMesh::mBones). Their names *must* be unique.
     *
     * Cameras and lights reference a specific node by name - if there
     * are multiple nodes with this name, they are assigned to each of them.
     *
     * There are no limitations with regard to the characters contained in
     * the name string as it is usually taken directly from the source file.
     *
     * Implementations should be able to handle tokens such as whitespace, tabs,
     * line feeds, quotation marks, ampersands etc.
     *
     * Sometimes assimp introduces new nodes not present in the source file
     * into the hierarchy (usually out of necessity because sometimes the
     * source hierarchy format is simply not compatible). Their names are
     * surrounded by <> e.g.
     *  <DummyRootNode>.
     */
    public name: string = '';

    /** 
     * The transformation relative to the node's parent.
    */
    public transformation!: Mat;

    /**
     * Parent node. null if this node is the root node.
    */
    public parent: Nullable<aiNode> = null;

    /**
     *  The number of child nodes of this node.
    */
    public numChildren: int = 0;

    /**
     * The child nodes of this node. Empty if mNumChildren is 0.
    */
    public children: aiNode[] = [];

    /**
     * The number of meshes of this node.
    */
    public numMeshes: int = 0;

    /** The meshes of this node.
    */
    public meshes: aiMesh[] = [];

    /** Metadata associated with this node or null if there is no metadata.
      * Whether any metadata is generated depends on the source file format.
      * Importers that don't document any metadata don't write any.
    */
    public metadata: Nullable<aiMetadata> = null;

    /**
     * Constructor
     * @param {string} [name] - specific name for construction.
    */
    public constructor(name?: string) {
        if (name) this.name = name;
    }

    /** Searches for a node with a specific name, beginning at this
     *  nodes. Normally you will call this method on the root node
     *  of the scene.
     *
     *  @param {string} name - Name to search for
     *  @return Null or a valid Node if the search was successful.
    */
    public findNode(name: string): Nullable<aiNode> {
        if (name === this.name) return this;

        for (let child of this.children) {
            let p = child.findNode(name);
            if (p) return p;
        }

        return null;
    }

    /**
     * Add new children.
     * @param {aiNode[]} children - The array of nodes to add.
     */
    public addChildren(nodes: aiNode[]): void {
        if (nodes.length === 0) return;

        for (let node of nodes) {
            node.parent = this;
            this.children.push(node);
        }
    }
}

class ScenePrivateData {
    public origImporter: Nullable<Importer> = null;
    public postProcessingStepsApplied: int = 0;
    public isCopy: boolean = false;
}

export class aiScene {
    /** Any combination of the AI_SCENE_FLAGS_XXX flags. By default
    * this value is 0, no flags are set. Most applications will
    * want to reject all scenes with the AI_SCENE_FLAGS_INCOMPLETE
    * bit set.
    */
    public flags: int = 0;

    /** The root node of the hierarchy.
     * 
     * There will always be at least the root node if the import
     * was successful (and no special flags have been set).
     * Presence of further nodes depends on the format and content
     * of the imported file.
     */
    public rootNode: Nullable<aiNode> = null;

    /** The number of meshes in the scene. */
    public numMeshes: int = 0;

    /** The array of meshes. */
    public meshes: aiMesh[] = [];

    /** The number of materials in the scene. */
    public numMaterials: int = 0;

    /** The array of materials. */
    public materials: aiMaterial[] = [];

    /** The number of animations in the scene. */
    public numAnimations: int = 0;

    /** The array of animations. */
    public animations: aiAnimation[] = [];

    /** The number of textures embedded into the file */
    public numTextures: int = 0;

    /** The array of embedded textures.
    *
    * Not many file formats embed their textures into the file.
    * An example is Quake's MDL format (which is also used by
    * some GameStudio versions)
    */
    public textures: aiTexture[] = [];

    /** The number of light sources in the scene. Light sources
    * are fully optional, in most cases this attribute will be 0
    */
    public numLights: int = 0;

    /** The array of light sources.
    *
    * All light sources imported from the given file are
    * listed here. The array is mNumLights in size.
    */
    public lights: aiLight[] = [];

    /** The number of cameras in the scene. Cameras
    * are fully optional, in most cases this attribute will be 0
    */
    public numCameras: int = 0;

    /** The array of cameras.
    *
    * All cameras imported from the given file are listed here.
    * The array is numCameras in size. The first camera in the
    * array (if existing) is the default camera view into
    * the scene.
    */
    public cameras: aiCamera[] = [];

    /**
     *  @brief  The global metadata assigned to the scene itself.
     *
     *  This data contains global metadata which belongs to the scene like 
     *  unit-conversions, versions, vendors or other model-specific data. This 
     *  can be used to store format-specific metadata as well.
     */
    public metadata: Nullable<aiMetadata> = null;

    public constructor() {}

    public hasMeshes(): boolean { return this.meshes.length !== 0 && this.numMeshes !== 0; }
    public hasMaterials(): boolean { return this.materials.length !== 0 && this.numMaterials !== 0; }
    public hasLights(): boolean { return this.lights.length !== 0 && this.numLights !== 0; }
    public hasTextures(): boolean { return this.textures.length !== 0 && this.numTextures !== 0; }
    public hasCameras(): boolean { return this.cameras.length !== 0 && this.numCameras !== 0; }
    public hasAnimations(): boolean { return this.animations.length !== 0 && this.numAnimations !== 0; }

    public static GetShortFilename(filename: string): string {
        let lastSlash = filename.lastIndexOf('/');
        if (lastSlash === -1)
            lastSlash = filename.lastIndexOf('\\');
        return lastSlash == -1 ? filename : filename.substring(lastSlash + 1);
    }

    public getEmbeddedTexture(filename: string): Nullable<aiTexture> {
        if (filename.startsWith('*')) {
            let index = Number(filename.substring(1));
            if (isNaN(index) || this.numTextures <= index) return null
            return this.textures[index];
        }

        const shortFilename = aiScene.GetShortFilename(filename);
        for (let texture of this.textures) {
            if (shortFilename === aiScene.GetShortFilename(texture.fileName))
                return texture;
        }

        return null;
    }

    public get privateData(): ScenePrivateData {
        return this._privateData;
    }

    private _privateData: ScenePrivateData = new ScenePrivateData();

}