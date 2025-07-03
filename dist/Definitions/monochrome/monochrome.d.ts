/// <reference path="../../../src/global.d.ts" />
export default monochrome;
declare namespace monochrome {
    export const title: string;
    export const description: string;
    export { vertexShader };
    export { fragmentShader };
    export namespace properties {
        namespace inputMix {
            const type: string;
            const value: number[];
        }
        namespace outputMix {
            const type_1: string;
            export { type_1 as type };
            const value_1: number[];
            export { value_1 as value };
        }
    }
    export const inputs: string[];
}
import vertexShader from "./monochrome.vert";
import fragmentShader from "./monochrome.frag";
