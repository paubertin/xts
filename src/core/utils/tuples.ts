import { bool } from "./types";

namespace tuples {
    export type GLclampf2 = [GLclampf, GLclampf];
    export type GLclampf3 = [GLclampf, GLclampf, GLclampf];
    export type GLclampf4 = [GLclampf, GLclampf, GLclampf, GLclampf];


    export type GLfloat2 = [GLfloat, GLfloat];
    export type GLfloat3 = [GLfloat, GLfloat, GLfloat];
    export type GLfloat4 = [GLfloat, GLfloat, GLfloat, GLfloat];


    export type GLsizei2 = [GLsizei, GLsizei];
    export type GLsizei3 = [GLsizei, GLsizei, GLsizei];
    export type GLsizei4 = [GLsizei, GLsizei, GLsizei, GLsizei];

    export function clone4<T extends GLclampf | GLfloat | GLsizei>(x: [T, T, T, T]): [T, T, T, T] {
        return [x[0], x[1], x[2], x[3]];
    }

    export function equals4<T extends GLclampf | GLfloat | GLsizei>(x: [T, T, T, T], y: [T, T, T, T]): bool {
        return x[0] === y[0]
            && x[1] === y[1]
            && x[2] === y[2]
            && x[3] === y[3];
    }
}

export = tuples;