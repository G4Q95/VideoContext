import RenderGraph from "../rendergraph";
import SourceNode from "./sourcenode";
declare const TYPE = "CanvasNode";
declare class ImageNode extends SourceNode {
    _preloadTime: number;
    _attributes: Record<string, any>;
    _textureUploaded: boolean;
    _image: HTMLImageElement | undefined;
    /**
     * Initialise an instance of an ImageNode.
     * This should not be called directly, but created through a call to videoContext.createImageNode();
     */
    constructor(src: string | HTMLImageElement | ImageBitmap, gl: WebGL2RenderingContext, renderGraph: RenderGraph, currentTime: number, preloadTime?: number, attributes?: {});
    get elementURL(): string | MediaStream | undefined;
    _load(): void;
    _unload(): void;
    _seek(time: number): void;
    _update(currentTime: number): boolean | undefined;
}
export { TYPE as IMAGETYPE };
export default ImageNode;
