export class aiMesh {
    
}

export enum aiPrimitiveType
{
    /** A point primitive.
     *
     * This is just a single vertex in the virtual world,
     * #aiFace contains just one index for such a primitive.
     */
    POINT       = 0x1,

    /** A line primitive.
     *
     * This is a line defined through a start and an end position.
     * #aiFace contains exactly two indices for such a primitive.
     */
    LINE        = 0x2,

    /** A triangular primitive.
     *
     * A triangle consists of three indices.
     */
    TRIANGLE    = 0x4,

    /** A higher-level polygon with more than 3 edges.
     *
     * A triangle is a polygon, but polygon in this context means
     * "all polygons that are not triangles". The "Triangulate"-Step
     * is provided for your convenience, it splits all polygons in
     * triangles (which are much easier to handle).
     */
    POLYGON     = 0x8,
}