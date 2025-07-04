import HLSNode from "./hlsnode";
declare const TYPE = "HLSVideoNode";
export declare class HLSVideoNode extends HLSNode {
    /**
     * Initialise an instance of a VideoNode.
     * This should not be called directly, but created through a call to videoContext.hlsVideo();
     */
    constructor(...args: ConstructorParameters<typeof HLSNode>);
    _createElement(): void;
}
export { TYPE as HLSVIDEOTYPE };
export default HLSVideoNode;
