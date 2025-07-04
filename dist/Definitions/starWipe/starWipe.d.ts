/// <reference path="../../../src/global.d.ts" />
export default starWipe;
declare namespace starWipe {
    export const title: string;
    export const description: string;
    export { vertexShader };
    export { fragmentShader };
    export namespace properties {
        namespace mix {
            const type: string;
            const value: number;
        }
    }
    export const inputs: string[];
}
import vertexShader from "./starWipe.vert";
import fragmentShader from "./starWipe.frag";
