import GraphNode from "../graphnode";
import RenderGraph from "../rendergraph";
declare let STATE: {
    waiting: number;
    sequenced: number;
    playing: number;
    paused: number;
    ended: number;
    error: number;
};
declare const TYPE = "SourceNode";
export declare abstract class SourceNode extends GraphNode {
    _startTime: number;
    _stopTime: number;
    _displayName: string;
    _id: string;
    _state: number;
    _element: HTMLVideoElement | HTMLAudioElement | ImageBitmap | HTMLImageElement | undefined;
    _elementURL: string | MediaStream | undefined;
    _isResponsibleForElementLifeCycle: boolean;
    _currentTime: number;
    _ready: boolean;
    _loadCalled: boolean;
    _stretchPaused: boolean;
    _texture: WebGLTexture | null;
    _callbacks: Array<{
        type: string;
        func: Function;
    }>;
    /**
     * Initialise an instance of a SourceNode.
     * This is the base class for other Nodes which generate media to be passed into the processing pipeline.
     */
    constructor(src: any, gl: WebGL2RenderingContext, renderGraph: RenderGraph, currentTime: number);
    /**
     * Returns the state of the node.
     * 0 - Waiting, start() has not been called on it yet.
     * 1 - Sequenced, start() has been called but it is not playing yet.
     * 2 - Playing, the node is playing.
     * 3 - Paused, the node is paused.
     * 4 - Ended, playback of the node has finished.
     *
     * @example
     * var ctx = new VideoContext();
     * var videoNode = ctx.createVideoSourceNode('video.mp4');
     * console.log(videoNode.state); //will output 0 (for waiting)
     * videoNode.start(5);
     * console.log(videoNode.state); //will output 1 (for sequenced)
     * videoNode.stop(10);
     * ctx.play();
     * console.log(videoNode.state); //will output 2 (for playing)
     * ctx.paused();
     * console.log(videoNode.state); //will output 3 (for paused)
     */
    get state(): number;
    /**
     * Returns the underlying DOM element which represents this source node.
     * Note: If a source node is created with a url rather than passing in an existing element then this will return undefined until the source node preloads the element.
     *
     * @return {Element} The underlying DOM element representing the media for the node. If the lifecycle of the video is owned UNSIGNED_BYTE the node itself, this can return undefined if the element hasn't been loaded yet.
     *
     * @example
     * //Accessing the Element on a VideoNode created via a URL
     * var ctx = new VideoContext();
     * var videoNode = ctx.createVideoSourceNode('video.mp4');
     * videoNode.start(0);
     * videoNode.stop(5);
     * //When the node starts playing the element should exist so set it's volume to 0
     * videoNode.regsiterCallback("play", function(){videoNode.element.volume = 0;});
     *
     *
     * @example
     * //Accessing the Element on a VideoNode created via an already existing element
     * var ctx = new VideoContext();
     * var videoElement = document.createElement("video");
     * var videoNode = ctx.createVideoSourceNode(videoElement);
     * videoNode.start(0);
     * videoNode.stop(5);
     * //The elemnt can be accessed any time because it's lifecycle is managed outside of the VideoContext
     * videoNode.element.volume = 0;
     *
     */
    get element(): HTMLVideoElement | HTMLAudioElement | ImageBitmap | HTMLImageElement | undefined;
    /**
     * Returns the duration of the node on a timeline. If no start time is set will return undefiend, if no stop time is set will return Infinity.
     *
     * @return {number} The duration of the node in seconds.
     *
     * @example
     * var ctx = new VideoContext();
     * var videoNode = ctx.createVideoSourceNode('video.mp4');
     * videoNode.start(5);
     * videoNode.stop(10);
     * console.log(videoNode.duration); //will output 10
     */
    get duration(): number | undefined;
    set stretchPaused(stretchPaused: boolean);
    get stretchPaused(): boolean;
    _load(): void;
    _unload(): void;
    /**
     * Register callbacks against one of these events: "load", "destroy", "seek", "pause", "play", "ended", "durationchange", "loaded", "error"
     *
     * @param {String} type - the type of event to register the callback against.
     * @param {function} func - the function to call.
     *
     * @example
     * var ctx = new VideoContext();
     * var videoNode = ctx.createVideoSourceNode('video.mp4');
     *
     * videoNode.registerCallback("load", function(){"video is loading"});
     * videoNode.registerCallback("play", function(){"video is playing"});
     * videoNode.registerCallback("ended", function(){"video has eneded"});
     *
     */
    registerCallback(type: string, func: Function): void;
    /**
     * Remove callback.
     *
     * @param {function} [func] - the callback to remove, if undefined will remove all callbacks for this node.
     *
     * @example
     * var ctx = new VideoContext();
     * var videoNode = ctx.createVideoSourceNode('video.mp4');
     *
     * videoNode.registerCallback("load", function(){"video is loading"});
     * videoNode.registerCallback("play", function(){"video is playing"});
     * videoNode.registerCallback("ended", function(){"video has eneded"});
     * videoNode.unregisterCallback(); //remove all of the three callbacks.
     *
     */
    unregisterCallback(func?: Function): void;
    _triggerCallbacks(type: string, data?: any): void;
    /**
     * Start playback at VideoContext.currentTime plus passed time. If passed time is negative, will play as soon as possible.
     *
     * @param {number} time - the time from the currentTime of the VideoContext which to start playing, if negative will play as soon as possible.
     * @return {boolean} Will return true is seqeuncing has succeded, or false if it is already sequenced.
     */
    start(time: number): boolean;
    /**
     * Start playback at an absolute time ont the VideoContext's timeline.
     *
     * @param {number} time - the time on the VideoContexts timeline to start playing.
     * @return {boolean} Will return true is seqeuncing has succeded, or false if it is already sequenced.
     */
    startAt(time: number): boolean;
    get startTime(): number;
    /**
     * Stop playback at VideoContext.currentTime plus passed time. If passed time is negative, will play as soon as possible.
     *
     * @param {number} time - the time from the currentTime of the video context which to stop playback.
     * @return {boolean} Will return true is seqeuncing has succeded, or false if the playback has already ended or if start hasn't been called yet, or if time is less than the start time.
     */
    stop(time: number): boolean;
    /**
     * Stop playback at an absolute time ont the VideoContext's timeline.
     *
     * @param {number} time - the time on the VideoContexts timeline to stop playing.
     * @return {boolean} Will return true is seqeuncing has succeded, or false if the playback has already ended or if start hasn't been called yet, or if time is less than the start time.
     */
    stopAt(time: number): boolean;
    get stopTime(): number;
    _seek(time: number): void;
    _pause(): void;
    _play(): void;
    _isReady(): boolean;
    _update(currentTime: number, triggerTextureUpdate?: boolean): boolean | void;
    /**
     * Clear any timeline state the node currently has, this puts the node in the "waiting" state, as if neither start nor stop had been called.
     */
    clearTimelineState(): void;
    /**
     * Destroy and clean-up the node.
     */
    destroy(): void;
}
export { STATE as SOURCENODESTATE };
export { TYPE as SOURCETYPE };
export default SourceNode;
