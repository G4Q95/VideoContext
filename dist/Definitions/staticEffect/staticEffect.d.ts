/// <reference path="../../../src/global.d.ts" />
export default staticEffect;
declare namespace staticEffect {
    export const title: string;
    export const description: string;
    export { vertexShader };
    export { fragmentShader };
    export namespace properties {
        namespace weight {
            const type: string;
            const value: number[];
        }
        namespace amount {
            const type_1: string;
            export { type_1 as type };
            const value_1: number;
            export { value_1 as value };
        }
    }
    export const inputs: string[];
}
import vertexShader from "./staticEffect.vert";
import fragmentShader from "./staticEffect.frag";
