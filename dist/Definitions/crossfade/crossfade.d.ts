/// <reference path="../../../src/global.d.ts" />
export default crossfade;
declare namespace crossfade {
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
import vertexShader from "./crossfade.vert";
import fragmentShader from "./crossfade.frag";
