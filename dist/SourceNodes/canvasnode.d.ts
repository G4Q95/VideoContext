import RenderGraph from "../rendergraph";
import SourceNode from "./sourcenode";
declare const TYPE = "CanvasNode";
declare class CanvasNode extends SourceNode {
    _preloadTime: number;
    /**
     * Initialise an instance of a CanvasNode.
     * This should not be called directly, but created through a call to videoContext.createCanvasNode();
     */
    constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, renderGraph: RenderGraph, currentTime: number, preloadTime?: number);
    _load(): void;
    _unload(): void;
    _seek(time: number): void;
    _update(currentTime: number): boolean | undefined;
}
export { TYPE as CANVASTYPE };
export default CanvasNode;
