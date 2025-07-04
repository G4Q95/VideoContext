/// <reference path="../../../src/global.d.ts" />
export default toColorAndBackFade;
declare namespace toColorAndBackFade {
    export const title: string;
    export const description: string;
    export { vertexShader };
    export { fragmentShader };
    export namespace properties {
        namespace mix {
            const type: string;
            const value: number;
        }
        namespace color {
            const type_1: string;
            export { type_1 as type };
            const value_1: number[];
            export { value_1 as value };
        }
    }
    export const inputs: string[];
}
import vertexShader from "./toColorAndBackFade.vert";
import fragmentShader from "./toColorAndBackFade.frag";
