import RenderGraph from "./rendergraph";
declare const TYPE = "GraphNode";
declare class GraphNode {
    _limitConnections: boolean;
    _inputNames: string[];
    _renderGraph: RenderGraph;
    _destroyed: boolean;
    _gl: WebGL2RenderingContext;
    _displayName: string;
    _needsRender: boolean;
    /**
     * Base class from which all processing and source nodes are derrived.
     */
    constructor(gl: WebGL2RenderingContext, renderGraph: RenderGraph, inputNames: string[], limitConnections?: boolean);
    /**
     * Get a string representation of the class name.
     *
     * @return String A string of the class name.
     */
    get displayName(): string;
    /**
     * Get the names of the inputs to this node.
     *
     * @return {String[]} An array of the names of the inputs ot the node.
     */
    get inputNames(): string[];
    /**
     * The maximum number of connections that can be made to this node. If there is not limit this will return Infinity.
     *
     * @return {number} The number of connections which can be made to this node.
     */
    get maximumConnections(): number;
    /**
     * Get an array of all the nodes which connect to this node.
     *
     * @return {GraphNode[]} An array of nodes which connect to this node.
     */
    get inputs(): GraphNode[];
    /**
     * Get an array of all the nodes which this node outputs to.
     *
     * @return {GraphNode[]} An array of nodes which this node connects to.
     */
    get outputs(): GraphNode[];
    /**
     * Get whether the node has been destroyed or not.
     *
     * @return {boolean} A true/false value of whather the node has been destoryed or not.
     */
    get destroyed(): boolean;
    get needsRender(): boolean;
    set needsRender(needsRender: boolean);
    /**
     * Connect this node to the targetNode
     *
     * @param {GraphNode} targetNode - the node to connect.
     * @param {(number| String)} [targetPort] - the port on the targetNode to connect to, this can be an index, a string identifier, or undefined (in which case the next available port will be connected to).
     *
     */
    connect(targetNode: GraphNode, targetPort?: number | string): boolean;
    /**
     * Disconnect this node from the targetNode. If targetNode is undefind remove all out-bound connections.
     *
     * @param {GraphNode} [targetNode] - the node to disconnect from. If undefined, disconnect from all nodes.
     *
     */
    disconnect(targetNode?: GraphNode): boolean;
    /**
     * Destory this node, removing it from the graph.
     */
    destroy(): void;
}
export { TYPE as GRAPHTYPE };
export default GraphNode;
