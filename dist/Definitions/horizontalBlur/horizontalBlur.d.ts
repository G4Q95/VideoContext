/// <reference path="../../../src/global.d.ts" />
export default horizontal_blur;
declare namespace horizontal_blur {
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
import vertexShader from "./horizontalBlur.vert";
import fragmentShader from "./horizontalBlur.frag";
