/// <reference path="../../../src/global.d.ts" />
export default verticalBlur;
declare namespace verticalBlur {
    export const title: string;
    export const description: string;
    export { vertexShader };
    export { fragmentShader };
    export namespace properties {
        namespace blurAmount {
            const type: string;
            const value: number;
        }
    }
    export const inputs: string[];
}
import vertexShader from "./verticalBlur.vert";
import fragmentShader from "./verticalBlur.frag";
