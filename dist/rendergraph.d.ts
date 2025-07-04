import GraphNode from "./graphnode";
export interface BaseConnection {
    source: GraphNode;
    destination: GraphNode;
    type: string;
}
export interface ZindexConnection extends BaseConnection {
    type: "zIndex";
    zIndex: number;
}
export interface NameConnection extends BaseConnection {
    type: "name";
    name: string;
}
export type IConnection = ZindexConnection | NameConnection;
declare class RenderGraph {
    connections: Array<IConnection>;
    /**
     * Manages the rendering graph.
     */
    constructor();
    /**
     * Get a list of nodes which are connected to the output of the passed node.
     *
     * @param {GraphNode} node - the node to get the outputs for.
     * @return {GraphNode[]} An array of the nodes which are connected to the output.
     */
    getOutputsForNode(node: GraphNode): GraphNode[];
    /**
     * Get a list of nodes which are connected, by input name, to the given node. Array contains objects of the form: {"source":sourceNode, "type":"name", "name":inputName, "destination":destinationNode}.
     *
     * @param {GraphNode} node - the node to get the named inputs for.
     * @return {Object[]} An array of objects representing the nodes and connection type, which are connected to the named inputs for the node.
     */
    getNamedInputsForNode(node: GraphNode): NameConnection[];
    /**
     * Get a list of nodes which are connected, by z-index name, to the given node. Array contains objects of the form: {"source":sourceNode, "type":"zIndex", "zIndex":0, "destination":destinationNode}.
     *
     * @param {GraphNode} node - the node to get the z-index refernced inputs for.
     * @return {Object[]} An array of objects representing the nodes and connection type, which are connected by z-Index for the node.
     */
    getZIndexInputsForNode(node: GraphNode): ZindexConnection[];
    /**
     * Get a list of nodes which are connected as inputs to the given node. The length of the return array is always equal to the number of inputs for the node, with undefined taking the place of any inputs not connected.
     *
     * @param {GraphNode} node - the node to get the inputs for.
     * @return {GraphNode[]} An array of GraphNodes which are connected to the node.
     */
    getInputsForNode(node: GraphNode): (GraphNode | undefined)[];
    /**
     * Check if a named input on a node is available to connect too.
     * @param {GraphNode} node - the node to check.
     * @param {string} inputName - the named input to check.
     */
    isInputAvailable(node: GraphNode, inputName: string): boolean;
    /**
     * Register a connection between two nodes.
     *
     * @param {GraphNode} sourceNode - the node to connect from.
     * @param {GraphNode} destinationNode - the node to connect to.
     * @param {(string | number)} [target] - the target port of the conenction, this could be a string to specfiy a specific named port, a number to specify a port by index, or undefined, in which case the next available port will be connected to.
     * @return {boolean} Will return true if connection succeeds otherwise will throw a ConnectException.
     */
    registerConnection(sourceNode: GraphNode, destinationNode: GraphNode, target: string | number | undefined): boolean;
    /**
     * Remove a connection between two nodes.
     * @param {GraphNode} sourceNode - the node to unregsiter connection from.
     * @param {GraphNode} destinationNode - the node to register connection to.
     * @return {boolean} Will return true if removing connection succeeds, or false if there was no connectionsction to remove.
     */
    unregisterConnection(sourceNode: GraphNode, destinationNode: GraphNode): boolean;
    static outputEdgesFor(node: GraphNode, connections: IConnection[]): (ZindexConnection | NameConnection)[];
    static inputEdgesFor(node: GraphNode, connections: IConnection[]): (ZindexConnection | NameConnection)[];
    static getInputlessNodes(connections: IConnection[]): GraphNode[];
}
export default RenderGraph;
