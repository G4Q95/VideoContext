/// <reference path="../../../src/global.d.ts" />
export default aaf_video_scale;
declare namespace aaf_video_scale {
    export const title: string;
    export const description: string;
    export { vertexShader };
    export { fragmentShader };
    export namespace properties {
        namespace scaleX {
            const type: string;
            const value: number;
        }
        namespace scaleY {
            const type_1: string;
            export { type_1 as type };
            const value_1: number;
            export { value_1 as value };
        }
        namespace bColor {
            const type_2: string;
            export { type_2 as type };
            const value_2: number[];
            export { value_2 as value };
        }
    }
    export const inputs: string[];
}
import vertexShader from "./aaf_video_scale.vert";
import fragmentShader from "./aaf_video_scale.frag";
