/// <reference path="../../../src/global.d.ts" />
export default colorThreshold;
declare namespace colorThreshold {
    export const title: string;
    export const description: string;
    export { vertexShader };
    export { fragmentShader };
    export namespace properties {
        namespace a {
            const type: string;
            const value: number;
        }
        namespace colorAlphaThreshold {
            const type_1: string;
            export { type_1 as type };
            const value_1: number[];
            export { value_1 as value };
        }
    }
    export const inputs: string[];
}
import vertexShader from "./colorThreshold.vert";
import fragmentShader from "./colorThreshold.frag";
