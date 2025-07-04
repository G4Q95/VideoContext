import RenderGraph from "../rendergraph";
import MediaNode from "./medianode";
import Hls from "hls.js";
declare const TYPE = "HLSNode";
export declare class HLSNode extends MediaNode {
    _hls: Hls;
    _src: string;
    _loaded: boolean;
    _hlsLoading: boolean;
    _duration: number | undefined;
    constructor(id: string, src: string, gl: WebGL2RenderingContext, renderGraph: RenderGraph, currentTime: number, globalPlaybackRate: number | undefined, sourceOffset: number | undefined, preloadTime: number | undefined, duration: number | undefined, debug?: boolean);
    _createElement(): void;
    _load(): void;
    _isReady(): boolean;
    _unload(): void;
    destroy(): void;
}
export { TYPE as HLSTYPE };
export default HLSNode;
