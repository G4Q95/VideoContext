/// <reference path="../../../src/global.d.ts" />
export default aaf_video_position;
declare namespace aaf_video_position {
    export const title: string;
    export const description: string;
    export { vertexShader };
    export { fragmentShader };
    export namespace properties {
        namespace positionOffsetX {
            const type: string;
            const value: number;
        }
        namespace positionOffsetY {
            const type_1: string;
            export { type_1 as type };
            const value_1: number;
            export { value_1 as value };
        }
    }
    export const inputs: string[];
}
import vertexShader from "./aaf_video_position.vert";
import fragmentShader from "./aaf_video_position.frag";
