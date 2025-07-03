/// <reference path="../../../src/global.d.ts" />
export default dreamfade;
declare namespace dreamfade {
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
import vertexShader from "./dreamfade.vert";
import fragmentShader from "./dreamfade.frag";
