import ProcessingNode from "../ProcessingNodes/processingnode";
import RenderGraph from "../rendergraph";
declare const TYPE = "DestinationNode";
declare class DestinationNode extends ProcessingNode {
    /**
     * Initialise an instance of a DestinationNode.
     *
     * There should only be a single instance of a DestinationNode per VideoContext instance. An VideoContext's destination can be accessed like so: videoContext.desitnation.
     *
     * You should not instantiate this directly.
     */
    constructor(gl: WebGL2RenderingContext, renderGraph: RenderGraph);
    _render(): void;
}
export { TYPE as DESTINATIONTYPE };
export default DestinationNode;
