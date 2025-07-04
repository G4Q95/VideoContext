/// <reference path="../../../src/global.d.ts" />
export default staticDissolve;
declare namespace staticDissolve {
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
import vertexShader from "./staticDissolve.vert";
import fragmentShader from "./staticDissolve.frag";
