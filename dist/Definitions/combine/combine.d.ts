/// <reference path="../../../src/global.d.ts" />
export default combine;
declare namespace combine {
    export const title: string;
    export const description: string;
    export { vertexShader };
    export { fragmentShader };
    export namespace properties {
        namespace a {
            const type: string;
            const value: number;
        }
    }
    export const inputs: string[];
}
import vertexShader from "./combine.vert";
import fragmentShader from "./combine.frag";
