import HLSNode from "./hlsnode";
declare const TYPE = "HLSAudioNode";
export declare class HLSAudioNode extends HLSNode {
    /**
     * Initialise an instance of a VideoNode.
     * This should not be called directly, but created through a call to videoContext.hlsAudio();
     */
    constructor(...args: ConstructorParameters<typeof HLSNode>);
    _createElement(): void;
    _update(currentTime: number): void;
}
export { TYPE as HLSAUDIOTYPE };
export default HLSAudioNode;
