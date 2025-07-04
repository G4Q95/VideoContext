import MediaNode from "./medianode";
declare const TYPE = "AudioNode";
declare class AudioNode extends MediaNode {
    /**
     * Initialise an instance of an AudioNode.
     * This should not be called directly, but created through a call to videoContext.audio();
     */
    constructor(...args: ConstructorParameters<typeof MediaNode>);
    _update(currentTime: number): void;
}
export { TYPE as AUDIOTYPE };
export default AudioNode;
