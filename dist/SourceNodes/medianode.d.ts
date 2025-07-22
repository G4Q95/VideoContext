import RenderGraph from "../rendergraph";
import type VideoElementCache from "../videoelementcache";
import SourceNode from "./sourcenode";
type GetNonFunctionPartialOfType<T> = Pick<T, {
    [P in keyof T]: T[P] extends Function ? never : P;
}[keyof T]>;
declare class MediaNode extends SourceNode {
    _globalPlaybackRate: number;
    _playbackRateUpdated: boolean;
    _elementType: string | undefined;
    _sourceOffset: number;
    _preloadTime: number;
    _mediaElementCache: VideoElementCache | undefined;
    _playbackRate: number;
    _attributes: Partial<GetNonFunctionPartialOfType<HTMLMediaElement>>;
    _loopElement: boolean;
    /**
     * Internal flag so we only apply the initial seek once per node. The lack of
     * this guard in upstream VideoContext causes an unexpected rewind-to-zero on
     * the first rendered frame whenever a non-zero `sourceOffset` is used. */
    _hasInitialSeek: boolean;
    _element: HTMLVideoElement | HTMLAudioElement | undefined;
    _loadTriggered: boolean | undefined;
    /**
     * Initialise an instance of a MediaNode.
     * This should not be called directly, but extended by other Node Types which use a `HTMLMediaElement`.
     */
    constructor(src: any, gl: WebGL2RenderingContext, renderGraph: RenderGraph, currentTime: number, globalPlaybackRate?: number, sourceOffset?: number, preloadTime?: number, mediaElementCache?: VideoElementCache | undefined, attributes?: {});
    set playbackRate(playbackRate: number);
    set stretchPaused(stretchPaused: boolean);
    get stretchPaused(): boolean;
    get playbackRate(): number;
    get elementURL(): string | MediaStream | undefined;
    get _isElementPlaying(): boolean;
    /**
     * @property {Boolean}
     * @summary - Check if the element is waiting on the network to continue playback
     */
    get _buffering(): boolean;
    set volume(volume: number);
    _triggerLoad(): void;
    /**
     * _load has two functions:
     *
     * 1. `_triggerLoad` which ensures the element has the correct src and is at the correct currentTime,
     *     so that the browser can start fetching media.
     *
     * 2.  `shouldPollForElementReadyState` waits until the element has a "readState" that signals there
     *     is enough media to start playback. This is a little confusing as currently structured.
     *     We're using the _update loop to poll the _load function which checks the element status.
     *     When ready we fire off the "loaded callback"
     *
     */
    _load(): void;
    _unload(): void;
    _seek(time: number): void;
    get _isInPreloadWindow(): boolean;
    _update(currentTime: number, triggerTextureUpdate?: boolean): boolean | void;
    clearTimelineState(): void;
    destroy(): void;
}
export default MediaNode;
