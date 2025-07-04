import MediaNode from "./medianode";
declare const TYPE = "VideoNode";
declare class VideoNode extends MediaNode {
    /**
     * Initialise an instance of a VideoNode.
     * This should not be called directly, but created through a call to videoContext.createVideoNode();
     */
    constructor(...args: ConstructorParameters<typeof MediaNode>);
}
export { TYPE as VIDEOTYPE };
export default VideoNode;
