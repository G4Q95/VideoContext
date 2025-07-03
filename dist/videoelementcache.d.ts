import VideoElementCacheItem from "./videoelementcacheitem";
import MediaNode from "./SourceNodes/medianode";
declare class VideoElementCache {
    _cacheItems: VideoElementCacheItem[];
    _cacheItemsInitialised: boolean;
    constructor(cache_size?: number);
    init(): void;
    /**
     * Find and return an empty initialised element or, if the cache is
     * empty, create a new one.
     *
     * @param {Object} mediaNode A `MediaNode` instance
     */
    getElementAndLinkToNode(mediaNode: MediaNode): HTMLVideoElement;
    /**
     * Unlink any media node currently linked to a cached video element.
     *
     * @param {VideoElement} element The element to unlink from any media nodes
     */
    unlinkNodeFromElement(element: HTMLVideoElement | HTMLAudioElement): void;
    get length(): number;
    get unused(): number;
}
export default VideoElementCache;
