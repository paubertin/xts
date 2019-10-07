import { Geometry } from "../geometry";
import { WebGLContext } from "../gl/webglContext";
import { int } from "../utils/types";
import { IndexBuffer, VertexBuffer } from "../gl/buffer";

export class SphereGeometry extends Geometry {
    protected _xSegments: int;
    protected _ySegments: int;
    constructor(context: WebGLContext, name?: string, xSegments: int = 16, ySegments: int = 16) {
        super(context, name);

        this._xSegments = xSegments;
        this._ySegments = ySegments;

        this._IBO = new IndexBuffer(context, name + 'IBO');
        this._NBO = new VertexBuffer(context, name + 'NBO');
        this._UVBO = new VertexBuffer(context, name + 'UVBO');
    }

    protected _initialize(): boolean {
        const PI = Math.PI;

        let positions = [];
        let uvs = [];
        let normals = [];
        let yRad = PI;
        let xRad = 2 * PI;
        let yInc = PI / this._ySegments;
        let xInc = PI * 2 / this._xSegments;
        for (let x = 0; x <= this._xSegments; ++x) {
            yRad = PI;
            for (let y = 0; y <= this._ySegments; ++y) {
                const xPos = Math.sin(yRad) * Math.cos(xRad);
                const yPos = Math.cos(yRad);
                const zPos = Math.sin(yRad) * Math.sin(xRad);

                positions.push(xPos, yPos, zPos);
                uvs.push(x / this._xSegments, y / this._ySegments);

                const mag = 1 / Math.sqrt(xPos * xPos + yPos * yPos + zPos * zPos);
                normals.push(xPos * mag, yPos * mag, zPos * mag);

                yRad -= yInc;
            }
            xRad -= xInc;
        }

        let indices = [];
        // let oddRow: boolean = false;
        // for (let y = 0; y < this._ySegments; ++y) {
        //     if (!oddRow) {
        //         for (let x = 0; x <= this._xSegments; ++x) {
        //             indices.push(y * (this._xSegments + 1) + x);
        //             indices.push((y + 1) * (this._xSegments + 1) + x);
        //         }
        //     }
        //     else {
        //         for (let x = this._xSegments; x >= 0; --x) {
        //             indices.push((y + 1) * (this._xSegments + 1) + x);
        //             indices.push(y * (this._xSegments + 1) + x);
        //         }
        //     }
        //     oddRow = !oddRow;
        // }
        const idxCount = indices.length;

        const iLen = (this._xSegments) * (this._ySegments + 1);
        for(let i=0; i < iLen; ++i) {
            let xp = Math.floor(i / (this._ySegments + 1)); //Current longitude
            let yp = i % (this._ySegments + 1);             //Current latitude

            //Column index of row R and R+1
            indices.push(xp * (this._ySegments + 1) + yp, (xp+1) * (this._ySegments + 1) + yp);

            //Create Degenerate Triangle, Last AND first index of the R+1 (next row that becomes the top row )
            if(yp === this._ySegments && i < iLen-1)
                indices.push( (xp + 1) * (this._ySegments + 1) + yp, (xp + 1) * (this._ySegments + 1));
        }

        const gl = this.context.gl;
        const usage = gl.STATIC_DRAW;
        let valid = this._IBO.initialize() && this._NBO.initialize() && this._UVBO.initialize();

        this._VAO.bind();

        this._VBO.bind();
        this._VBO.pushData(new Float32Array(positions), usage);
        this._VBO.enableAttrib(0, 3, gl.FLOAT, false);

        this._NBO.bind();
        this._NBO.pushData(new Float32Array(normals), usage);
        this._NBO.enableAttrib(1, 3, gl.FLOAT, false);

        this._UVBO.bind();
        this._UVBO.pushData(new Float32Array(uvs), usage);
        this._UVBO.enableAttrib(2, 2, gl.FLOAT, false);

        this._IBO.bind();
        this._IBO.pushData(new Uint16Array(indices), usage);
        
        this._VAO.eltCount = indices.length;

        this._VAO.unbind();
        this._unBindBuffers();

        return valid;
    }

    protected _unBindBuffers(): void {
        this._VBO.unbind();
        this._NBO.unbind();
        this._UVBO.unbind();
    }

    public render(mode?: GLenum): void {
        const gl = this.context.gl;
        if (mode === undefined) mode = gl.TRIANGLE_STRIP;
        gl.drawElements(mode, this._VAO.eltCount!, gl.UNSIGNED_SHORT, 0);
    }
}