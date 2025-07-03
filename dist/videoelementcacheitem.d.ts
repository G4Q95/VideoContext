import MediaNode from "./SourceNodes/medianode";
/**
 * A video element item created and managed by the `VideoElementCache`.
 *
 * This creates and stores a `<video />` element, which is assigned
 * to a `MediaNode` by the `VideoElementCache` for playback. Once
 * playback has completed the `MediaNode` association will be removed
 * and potentially replaced with another.
 */
declare class VideoElementCacheItem {
    _element: HTMLVideoElement;
    _node: MediaNode | null;
    constructor(node?: MediaNode | null);
    _createElement(): HTMLVideoElement;
    get element(): HTMLVideoElement;
    set element(element: HTMLVideoElement);
    linkNode(node: MediaNode): void;
    unlinkNode(): void;
    isPlaying(): boolean | null;
}
export default VideoElementCacheItem;
