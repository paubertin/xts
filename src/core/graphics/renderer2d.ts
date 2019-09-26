import { gl } from "../gl";

export interface IRenderer2D {

}

export class Renderer2D implements IRenderer2D {
    private VAO!: WebGLVertexArrayObject;
    private VBO!: WebGLBuffer;

    constructor() {

    }

    public initialize(): void {
        // gl.clearColor(0.004, 0.004, 0.004, 1);
        // gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this.configureQuad();
    }

    public preRender(): void {
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    public renderQuad(): void {
        gl.bindVertexArray(this.VAO);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindVertexArray(null);
    }

    private configureQuad(): void {
        let vertices: number[] = [
            0.0,    1.0,    0.0,    1.0,    // top left
            0.0,    0.0,    0.0,    0.0,    // bottom left
            1.0,    1.0,    1.0,    1.0,    // top right
            1.0,    0.0,    1.0,    0.0,    // bottom right
        ];
        this.VAO = <WebGLVertexArrayObject>(gl.createVertexArray());
        this.VBO = <WebGLBuffer>(gl.createBuffer());
        gl.bindVertexArray(this.VAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(0);
        gl.bindVertexArray(null);
    }


}