/// <reference path="../../../src/global.d.ts" />
export default opacity;
declare namespace opacity {
    export const title: string;
    export const description: string;
    export { vertexShader };
    export { fragmentShader };
    export namespace properties {
        namespace opacity {
            const type: string;
            const value: number;
        }
    }
    export const inputs: string[];
}
import vertexShader from "./opacity.vert";
import fragmentShader from "./opacity.frag";
