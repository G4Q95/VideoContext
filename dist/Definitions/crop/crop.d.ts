/// <reference path="../../../src/global.d.ts" />
export default crop;
declare namespace crop {
    export const title: string;
    export const description: string;
    export { vertexShader };
    export { fragmentShader };
    export namespace properties {
        namespace x {
            const type: string;
            const value: number;
        }
        namespace y {
            const type_1: string;
            export { type_1 as type };
            const value_1: number;
            export { value_1 as value };
        }
        namespace width {
            const type_2: string;
            export { type_2 as type };
            const value_2: number;
            export { value_2 as value };
        }
        namespace height {
            const type_3: string;
            export { type_3 as type };
            const value_3: number;
            export { value_3 as value };
        }
    }
    export const inputs: string[];
}
import vertexShader from "./crop.vert";
import fragmentShader from "./crop.frag";
