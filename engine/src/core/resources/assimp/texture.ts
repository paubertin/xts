import { char, Nullable, int } from "src/core/utils/types";
import { aiColor4D } from "./color";

export class aiTexel {
    constructor(
        public b: char,
        public g: char,
        public r: char,
        public a: char) {}

    public equals(other: aiTexel): boolean {
        return this.b === other.b
            && this.g === other.g
            && this.r === other.r
            && this.a === other.a
        ;
    }

    public toAiColor4d(): aiColor4D {
        return new aiColor4D(this.r / 255.0, this.g / 255.0, this.b / 255.0, this.a / 255.0);
    }
}

export class aiTexture {
    public fileName: string = '';
    public width: int = 0;
    public height: int = 0;
    public achFormatHint: string = '00000000';
    public data: aiTexel[] = [];
}