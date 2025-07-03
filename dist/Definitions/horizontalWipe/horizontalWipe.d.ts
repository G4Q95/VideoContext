/// <reference path="../../../src/global.d.ts" />
export default horizontal_wipe;
declare namespace horizontal_wipe {
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
import vertexShader from "./horizontalWipe.vert";
import fragmentShader from "./horizontalWipe.frag";
