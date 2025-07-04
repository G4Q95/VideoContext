import ProcessingNode from "./processingnode";
import RenderGraph from "../rendergraph";
import { IDefinition } from "../Definitions/definitions";
declare const TYPE = "CompositingNode";
declare class CompositingNode extends ProcessingNode {
    _placeholderTexture: WebGLTexture | null;
    /**
     * Initialise an instance of a Compositing Node. You should not instantiate this directly, but use VideoContest.createCompositingNode().
     */
    constructor(gl: WebGL2RenderingContext, renderGraph: RenderGraph, definition: IDefinition);
    _render(): void;
}
export { TYPE as COMPOSITINGTYPE };
export default CompositingNode;
