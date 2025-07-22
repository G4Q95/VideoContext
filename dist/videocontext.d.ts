import { createSigmaGraphDataFromRenderGraph, visualiseVideoContextTimeline, visualiseVideoContextGraph, createControlFormForNode, UpdateablesManager, exportToJSON, importSimpleEDL } from "./utils";
import VideoNode from "./SourceNodes/videonode";
import AudioNode from "./SourceNodes/audionode";
import ImageNode from "./SourceNodes/imagenode";
import CanvasNode from "./SourceNodes/canvasnode";
import SourceNode from "./SourceNodes/sourcenode";
import CompositingNode from "./ProcessingNodes/compositingnode";
import DestinationNode from "./DestinationNode/destinationnode";
import EffectNode from "./ProcessingNodes/effectnode";
import TransitionNode from "./ProcessingNodes/transitionnode";
import RenderGraph from "./rendergraph";
import VideoElementCache from "./videoelementcache";
import { IDefinition } from "./Definitions/definitions";
import ProcessingNode from "./ProcessingNodes/processingnode";
import MediaNode from "./SourceNodes/medianode";
import HLSNode from "./SourceNodes/hlsnode";
import HLSVideoNode from "./SourceNodes/hlsvideonode";
import HLSAudioNode from "./SourceNodes/hlsaudionode";
export { SourceNode } from "./SourceNodes/sourcenode";
export { HLSVideoNode } from "./SourceNodes/hlsvideonode";
export { HLSAudioNode } from "./SourceNodes/hlsaudionode";
export * from "./utils";
interface TimelineCallback {
    time: number;
    func: Function;
    ordering: number;
}
/**
 * VideoContext.
 * @module VideoContext
 */
export default class VideoContext {
    /**
     * Video Context States
     * @readonly
     * @typedef {Object} STATE
     * @property {number} STATE.PLAYING - All sources are active
     * @property {number} STATE.PAUSED - All sources are paused
     * @property {number} STATE.SEEKING - VideoContext is currently seeking to a new currentTime.
     * @property {number} STATE.STALLED - One or more sources is unable to play
     * @property {number} STATE.ENDED - All sources have finished playing
     * @property {number} STATE.BROKEN - The render graph is in a broken state
     */
    static STATE: Readonly<{
        PLAYING: 0;
        PAUSED: 1;
        STALLED: 2;
        ENDED: 3;
        BROKEN: 4;
        SEEKING: 5;
    }>;
    /**
     * Video Context Events
     * @readonly
     * @typedef {Object} EVENTS
     * @property {string} EVENTS.UPDATE - Called any time a frame is rendered to the screen.
     * @property {string} EVENTS.SEEKING - Called any time the VideoContext starts seeking to a new time.
     * @property {string} EVENTS.SEEKED - Called any time the VideoContext has finished (frame has rendered) seeking to a new time .
     * @property {string} EVENTS.PLAY - Called any time the VideoContext has been requested to play.
     * @property {string} EVENTS.PLAYING - Called any time the VideoContext has started playing (state = PLAYING)
     * @property {string} EVENTS.PAUSE - Called any time the VideoContext has been requested to pause.
     * @property {string} EVENTS.PAUSED - Called any time the VideoContext has gone into the PAUSED state.
     * @property {string} EVENTS.STALLED - happens anytime the playback is stopped due to buffer starvation for playing assets.
     * @property {string} EVENTS.ENDED - Called once plackback has finished (i.e ctx.currentTime == ctx.duration).
     * @property {string} EVENTS.CONTENT - Called at the start of a time region where there is content playing out of one or more sourceNodes.
     * @property {number} EVENTS.NOCONTENT - Called at the start of any time region where the VideoContext is still playing, but there are currently no active playing sources.
     */
    static EVENTS: Readonly<{
        UPDATE: "update";
        SEEKING: "seeking";
        SEEKED: "seeked";
        PLAY: "play";
        PLAYING: "playing";
        PAUSE: "pause";
        PAUSED: "paused";
        STALLED: "stalled";
        ENDED: "ended";
        CONTENT: "content";
        NOCONTENT: "nocontent";
    }>;
    static visualiseVideoContextTimeline: typeof visualiseVideoContextTimeline;
    static visualiseVideoContextGraph: typeof visualiseVideoContextGraph;
    static createControlFormForNode: typeof createControlFormForNode;
    static createSigmaGraphDataFromRenderGraph: typeof createSigmaGraphDataFromRenderGraph;
    static exportToJSON: typeof exportToJSON;
    static updateablesManager: UpdateablesManager;
    static importSimpleEDL: typeof importSimpleEDL;
    _canvas: HTMLCanvasElement;
    _endOnLastSourceEnd: boolean;
    _gl: WebGL2RenderingContext;
    _useVideoElementCache: boolean;
    _videoElementCache: VideoElementCache;
    _id: string;
    _renderGraph: RenderGraph;
    _sourceNodes: SourceNode[];
    _processingNodes: ProcessingNode[];
    _timeline: never[];
    _currentTime: number;
    _state: number;
    _playbackRate: number;
    _volume: number;
    _sourcesPlaying: boolean | undefined;
    _destinationNode: DestinationNode;
    _callbacks: Map<string, Function[]>;
    _timelineCallbacks: Array<TimelineCallback>;
    _renderNodeOnDemandOnly: boolean;
    _lastRenderTime: number | undefined;
    _runAfterNextRender: (() => boolean) | undefined;
    /**
     * Indicates whether the VideoContext instance has already been prepared via `prepare()`.
     * Preparation performs an internal warm-up (first render pass) without leaving the
     * PAUSED state so that a subsequent `play()` starts with minimal latency.
     */
    _prepared: boolean;
    /**
     * Initialise the VideoContext and render to the specific canvas. A 2nd parameter can be passed to the constructor which is a function that get's called if the VideoContext fails to initialise.
     *
     * @param {Canvas} canvas - the canvas element to render the output to.
     * @param {function} [initErrorCallback] - a callback for if initialising the canvas failed.
     * @param {Object} [options] - a number of custom options which can be set on the VideoContext, generally best left as default.
     * @param {boolean} [options.manualUpdate=false] - Make Video Context not use the updatable manager
     * @param {boolean} [options.endOnLastSourceEnd=true] - Trigger an `ended` event when the current time goes above the duration of the composition
     * @param {boolean} [options.useVideoElementCache=true] - Creates a pool of video element that will be all initialised at the same time. Important for mobile support
     * @param {number} [options.videoElementCacheSize=6] - Number of video element in the pool
     * @param {object} [options.webglContextAttributes] - A set of attributes used when getting the GL context. Alpha will always be `true`.
     * @param {boolean} [options.renderNodeOnDemandOnly=false] - Only render if a node needsRender flag is true to improve performance.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement, () => console.error("Sorry, your browser dosen\'t support WebGL"));
     * var videoNode = ctx.video("video.mp4");
     * videoNode.connect(ctx.destination);
     * videoNode.start(0);
     * videoNode.stop(10);
     * ctx.play();
     *
     */
    constructor(canvas: HTMLCanvasElement, initErrorCallback: Function | undefined, { manualUpdate, endOnLastSourceEnd, useVideoElementCache, videoElementCacheSize, webglContextAttributes, renderNodeOnDemandOnly }?: {
        manualUpdate?: boolean | undefined;
        endOnLastSourceEnd?: boolean | undefined;
        useVideoElementCache?: boolean | undefined;
        videoElementCacheSize?: number | undefined;
        webglContextAttributes?: {} | undefined;
        renderNodeOnDemandOnly?: boolean | undefined;
    });
    /**
     * Returns an ID assigned to the VideoContext instance. This will either be the same id as the underlying canvas element,
     * or a uniquely generated one.
     */
    get id(): string;
    /**
     * Set the ID of the VideoContext instance. This should be unique.
     */
    set id(newID: string);
    /**
     * Register a callback to happen at a specific point in time.
     * @param {number} time - the time at which to trigger the callback.
     * @param {Function} func - the callback to register.
     * @param {number} ordering - the order in which to call the callback if more than one is registered for the same time.
     */
    registerTimelineCallback(time: number, func: Function, ordering?: number): void;
    /**
     * Unregister a callback which happens at a specific point in time.
     * @param {Function} func - the callback to unregister.
     */
    unregisterTimelineCallback(func: Function): void;
    /**
     * Register a callback to listen to one of the events defined in `VideoContext.EVENTS`
     *
     * @param {String} type - the event to register against.
     * @param {Function} func - the callback to register.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * ctx.registerCallback(VideoContext.EVENTS.STALLED, () => console.log("Playback stalled"));
     * ctx.registerCallback(VideoContext.EVENTS.UPDATE, () => console.log("new frame"));
     * ctx.registerCallback(VideoContext.EVENTS.ENDED, () => console.log("Playback ended"));
     */
    registerCallback(type: string, func: Function): false | undefined;
    /**
     * Remove a previously registered callback
     *
     * @param {Function} func - the callback to remove.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     *
     * //the callback
     * var updateCallback = () => console.log("new frame");
     *
     * //register the callback
     * ctx.registerCallback(VideoContext.EVENTS.UPDATE, updateCallback);
     * //then unregister it
     * ctx.unregisterCallback(updateCallback);
     *
     */
    unregisterCallback(func: Function): boolean;
    _callCallbacks(type: string): void;
    /**
     * Get the canvas that the VideoContext is using.
     *
     * @return {HTMLCanvasElement} The canvas that the VideoContext is using.
     *
     */
    get element(): HTMLCanvasElement;
    /**
     * Get the current state.
     * @return {STATE} The number representing the state.
     *
     */
    get state(): number;
    /**
     * Set the progress through the internal timeline.
     * Setting this can be used as a way to implement a scrubbable timeline.
     *
     * @param {number} currentTime - this is the currentTime to set in seconds.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("video.mp4");
     * videoNode.connect(ctx.destination);
     * videoNode.start(0);
     * videoNode.stop(20);
     * ctx.currentTime = 10; // seek 10 seconds in
     * ctx.play();
     *
     */
    set currentTime(currentTime: number);
    /**
     * Get how far through the internal timeline has been played.
     *
     * Getting this value will give the current playhead position. Can be used for updating timelines.
     * @return {number} The time in seconds through the current playlist.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("video.mp4");
     * videoNode.connect(ctx.destination);
     * videoNode.start(0);
     * videoNode.stop(10);
     * ctx.play();
     * setTimeout(() => console.log(ctx.currentTime),1000); //should print roughly 1.0
     *
     */
    get currentTime(): number;
    /**
     * Get the time at which the last node in the current internal timeline finishes playing.
     *
     * @return {number} The end time in seconds of the last video node to finish playing.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * console.log(ctx.duration); //prints 0
     *
     * var videoNode = ctx.video("video.mp4");
     * videoNode.connect(ctx.destination);
     * videoNode.start(0);
     * videoNode.stop(10);
     *
     * console.log(ctx.duration); //prints 10
     *
     * ctx.play();
     */
    get duration(): number;
    /**
     * Get the final node in the render graph which represents the canvas to display content on to.
     *
     * This proprety is read-only and there can only ever be one destination node. Other nodes can connect to this but you cannot connect this node to anything.
     *
     * @return {DestinationNode} A graph node representing the canvas to display the content on.
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("video.mp4");
     * videoNode.start(0);
     * videoNode.stop(10);
     * videoNode.connect(ctx.destination);
     *
     */
    get destination(): DestinationNode;
    /**
     * Set the playback rate of the VideoContext instance.
     * This will alter the playback speed of all media elements played through the VideoContext.
     *
     * @param {number} rate - this is the playback rate.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("video.mp4");
     * videoNode.start(0);
     * videoNode.stop(10);
     * videoNode.connect(ctx.destination);
     * ctx.playbackRate = 2;
     * ctx.play(); // Double playback rate means this will finish playing in 5 seconds.
     */
    set playbackRate(rate: number);
    /**
     *  Return the current playbackRate of the video context.
     * @return {number} A value representing the playbackRate. 1.0 by default.
     */
    get playbackRate(): number;
    /**
     * Set the volume of all MediaNode created in the VideoContext.
     * @param {number} volume - the volume to apply to the video nodes.
     */
    set volume(vol: number);
    /**
     * Return the current volume of the video context.
     * @return {number} A value representing the volume. 1.0 by default.
     */
    get volume(): number;
    /**
     * Start the VideoContext playing
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("video.mp4");
     * videoNode.connect(ctx.destination);
     * videoNode.start(0);
     * videoNode.stop(10);
     * ctx.play();
     */
    play(): boolean;
    /**
     * Warm-up the VideoContext rendering pipeline so that a subsequent `play()` call
     * starts almost instantly. Internally this simply triggers a normal `play()`, waits
     * for the first "playing" callback (after the initial render pass) and then pauses
     * the context again. If the context was already prepared earlier it resolves
     * immediately.
     *
     * This mirrors the pre-roll behaviour we previously emulated in application code
     * (warmStartVC) but lives inside the library for cleaner reuse.
     *
     * @returns Promise<void> which resolves once the engine is prepared.
     */
    prepare(): Promise<void>;
    /**
     * Pause playback of the VideoContext
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("video.mp4");
     * videoNode.connect(ctx.destination);
     * videoNode.start(0);
     * videoNode.stop(20);
     * ctx.currentTime = 10; // seek 10 seconds in
     * ctx.play();
     * setTimeout(() => ctx.pause(), 1000); //pause playback after roughly one second.
     */
    pause(): boolean;
    clearCanvas(): void;
    /**
     * Create a new node representing a video source
     *
     * @param {string|HTMLVideoElement|MediaStream} - The URL or video element to create the video from.
     * @param {number} [sourceOffset=0] - Offset into the start of the source video to start playing from.
     * @param {number} [preloadTime=4] - How many seconds before the video is to be played to start loading it.
     * @param {Object} [videoElementAttributes] - A dictionary of attributes to map onto the underlying video element.
     * @return {VideoNode} A new video node.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("bigbuckbunny.mp4");
     */
    video(src: string | HTMLVideoElement | MediaStream, sourceOffset?: number, preloadTime?: number, videoElementAttributes?: {}): VideoNode;
    /**
     * Create a new node representing a HLS video source
     *
     * @param {string} [id] - The id of the node used mostly for debugging.
     * @param {string} [src] - The hls stream URL to create the video from.
     * @param {number} [duration=undefiend] - The duration of the hls srouce (may be less than the actual video length)
     *                              the node will prevent loading beyond this time. If undefined it will not be limited.
     * @param {number} [sourceOffset=0] - Offset into the start of the source video to start playing from.
     * @param {number} [preloadTime=4] - How many seconds before the video is to be played to start loading it.
     * @return {HLSNode} A new HLSNode.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.hlsVideo("test", "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");
     */
    hlsVideo(id: string, src: string, duration?: number, sourceOffset?: number, preloadTime?: number, debug?: boolean): HLSNode;
    /**
     * Create a new node representing a HLS audio source
     *
     * @param {string} [id] - The id of the node used mostly for debugging.
     * @param {string} [src] - The hls stream URL to create the video from.
     * @param {number} [duration=undefiend] - The duration of the hls srouce (may be less than the actual audio length)
     *                              the node will prevent loading beyond this time. If undefined it will not be limited.
     * @param {number} [sourceOffset=0] - Offset into the start of the source audio to start playing from.
     * @param {number} [preloadTime=4] - How many seconds before the video is to be played to start loading it.
     * @return {HLSNode} A new HLSNode.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.hlsAudio("test", "https://pl.streamingvideoprovider.com/mp3-playlist/playlist.m3u8");
     */
    hlsAudio(id: string, src: string, duration?: number, sourceOffset?: number, preloadTime?: number, debug?: boolean): HLSNode;
    /**
     * Create a new node representing an audio source
     * @param {string|HTMLAudioElement|MediaStream} src - The url or audio element to create the audio node from.
     * @param {number} [sourceOffset=0] - Offset into the start of the source audio to start playing from.
     * @param {number} [preloadTime=4] - How long before a node is to be displayed to attmept to load it.
     * @param {Object} [imageElementAttributes] - Any attributes to be given to the underlying image element.
     * @return {AudioNode} A new audio node.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var audioNode = ctx.audio("ziggystardust.mp3");
     */
    audio(src: string | HTMLAudioElement | MediaStream, sourceOffset?: number, preloadTime?: number, audioElementAttributes?: {}): AudioNode;
    /**
     * Create a new node representing an image source
     * @param {string|HTMLImageElement|ImageBitmap} src - The url or image element to create the image node from.
     * @param {number} [preloadTime=4] - How long before a node is to be displayed to attmept to load it.
     * @param {Object} [imageElementAttributes] - Any attributes to be given to the underlying image element.
     * @return {ImageNode} A new image node.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var imageNode = ctx.image("image.png");
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var imageElement = document.getElementById("image");
     * var ctx = new VideoContext(canvasElement);
     * var imageNode = ctx.image(imageElement);
     */
    image(src: string | HTMLImageElement | ImageBitmap, preloadTime?: number, imageElementAttributes?: {}): ImageNode;
    /**
     * Create a new node representing a canvas source
     * @param {Canvas} src - The canvas element to create the canvas node from.
     * @return {CanvasNode} A new canvas node.
     */
    canvas(canvas: HTMLCanvasElement): CanvasNode;
    /**
     * Create a new effect node.
     * @param {IDefinition} definition - this is an object defining the shaders, inputs, and properties of the compositing node to create. Builtin definitions can be found by accessing VideoContext.DEFINITIONS.
     * @return {EffectNode} A new effect node created from the passed definition
     */
    effect(definition: IDefinition): EffectNode;
    /**
     * Create a new compositiing node.
     *
     * Compositing nodes are used for operations such as combining multiple video sources into a single track/connection for further processing in the graph.
     *
     * A compositing node is slightly different to other processing nodes in that it only has one input in it's definition but can have unlimited connections made to it.
     * The shader in the definition is run for each input in turn, drawing them to the output buffer. This means there can be no interaction between the spearte inputs to a compositing node, as they are individually processed in seperate shader passes.
     *
     * @param {IDefinition} definition - this is an object defining the shaders, inputs, and properties of the compositing node to create. Builtin definitions can be found by accessing VideoContext.DEFINITIONS
     *
     * @return {CompositingNode} A new compositing node created from the passed definition.
     *
     * @example
     *
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     *
     * //A simple compositing node definition which just renders all the inputs to the output buffer.
     * var combineDefinition = {
     *     vertexShader : "\
     *         attribute vec2 a_position;\
     *         attribute vec2 a_texCoord;\
     *         varying vec2 v_texCoord;\
     *         void main() {\
     *             gl_Position = vec4(vec2(2.0,2.0)*vec2(1.0, 1.0), 0.0, 1.0);\
     *             v_texCoord = a_texCoord;\
     *         }",
     *     fragmentShader : "\
     *         precision mediump float;\
     *         uniform sampler2D u_image;\
     *         uniform float a;\
     *         varying vec2 v_texCoord;\
     *         varying float v_progress;\
     *         void main(){\
     *             vec4 color = texture2D(u_image, v_texCoord);\
     *             gl_FragColor = color;\
     *         }",
     *     properties:{
     *         "a":{type:"uniform", value:0.0},
     *     },
     *     inputs:["u_image"]
     * };
     * //Create the node, passing in the definition.
     * var trackNode = videoCtx.compositor(combineDefinition);
     *
     * //create two videos which will play at back to back
     * var videoNode1 = ctx.video("video1.mp4");
     * videoNode1.play(0);
     * videoNode1.stop(10);
     * var videoNode2 = ctx.video("video2.mp4");
     * videoNode2.play(10);
     * videoNode2.stop(20);
     *
     * //Connect the nodes to the combine node. This will give a single connection representing the two videos which can
     * //be connected to other effects such as LUTs, chromakeyers, etc.
     * videoNode1.connect(trackNode);
     * videoNode2.connect(trackNode);
     *
     * //Don't do anything exciting, just connect it to the output.
     * trackNode.connect(ctx.destination);
     *
     */
    compositor(definition: IDefinition): CompositingNode;
    /**
     * Instanciate a custom built source node
     * @param {typeof SourceNode} CustomSourceNode
     * @param {any} src
     * @param  {...any} options
     */
    customSourceNode<T extends any[]>(CustomSourceNode: {
        new (src: any, gl: WebGL2RenderingContext, renderGraph: RenderGraph, currentTime: number, ...args: T): SourceNode;
    }, src: any, ...options: T): SourceNode;
    /**
     * @depricated
     */
    createCompositingNode(definition: IDefinition): CompositingNode;
    /**
     * Create a new transition node.
     *
     * Transistion nodes are a type of effect node which have parameters which can be changed as events on the timeline.
     *
     * For example a transition node which cross-fades between two videos could have a "mix" property which sets the
     * progress through the transistion. Rather than having to write your own code to adjust this property at specfic
     * points in time a transition node has a "transition" function which takes a startTime, stopTime, targetValue, and a
     * propertyName (which will be "mix"). This will linearly interpolate the property from the curernt value to
     * tragetValue between the startTime and stopTime.
     *
     * @param {Object} definition - this is an object defining the shaders, inputs, and properties of the transition node to create.
     * @return {TransitionNode} A new transition node created from the passed definition.
     * @example
     *
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     *
     * //A simple cross-fade node definition which cross-fades between two videos based on the mix property.
     * var crossfadeDefinition = {
     *     vertexShader : "\
     *        attribute vec2 a_position;\
     *        attribute vec2 a_texCoord;\
     *        varying vec2 v_texCoord;\
     *        void main() {\
     *            gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
     *            v_texCoord = a_texCoord;\
     *         }",
     *     fragmentShader : "\
     *         precision mediump float;\
     *         uniform sampler2D u_image_a;\
     *         uniform sampler2D u_image_b;\
     *         uniform float mix;\
     *         varying vec2 v_texCoord;\
     *         varying float v_mix;\
     *         void main(){\
     *             vec4 color_a = texture2D(u_image_a, v_texCoord);\
     *             vec4 color_b = texture2D(u_image_b, v_texCoord);\
     *             color_a[0] *= mix;\
     *             color_a[1] *= mix;\
     *             color_a[2] *= mix;\
     *             color_a[3] *= mix;\
     *             color_b[0] *= (1.0 - mix);\
     *             color_b[1] *= (1.0 - mix);\
     *             color_b[2] *= (1.0 - mix);\
     *             color_b[3] *= (1.0 - mix);\
     *             gl_FragColor = color_a + color_b;\
     *         }",
     *     properties:{
     *         "mix":{type:"uniform", value:0.0},
     *     },
     *     inputs:["u_image_a","u_image_b"]
     * };
     *
     * //Create the node, passing in the definition.
     * var transitionNode = videoCtx.transition(crossfadeDefinition);
     *
     * //create two videos which will overlap by two seconds
     * var videoNode1 = ctx.video("video1.mp4");
     * videoNode1.play(0);
     * videoNode1.stop(10);
     * var videoNode2 = ctx.video("video2.mp4");
     * videoNode2.play(8);
     * videoNode2.stop(18);
     *
     * //Connect the nodes to the transistion node.
     * videoNode1.connect(transitionNode);
     * videoNode2.connect(transitionNode);
     *
     * //Set-up a transition which happens at the crossover point of the playback of the two videos
     * transitionNode.transition(8,10,1.0,"mix");
     *
     * //Connect the transition node to the output
     * transitionNode.connect(ctx.destination);
     *
     * //start playback
     * ctx.play();
     */
    transition(definition: IDefinition): TransitionNode;
    _isStalled(): boolean;
    /**
     * This allows manual calling of the update loop of the videoContext.
     *
     * @param {Number} dt - The difference in seconds between this and the previous calling of update.
     * @example
     *
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement, undefined, {"manualUpdate" : true});
     *
     * var previousTime;
     * function update(time){
     *     if (previousTime === undefined) previousTime = time;
     *     var dt = (time - previousTime)/1000;
     *     ctx.update(dt);
     *     previousTime = time;
     *     requestAnimationFrame(update);
     * }
     * update();
     *
     */
    update(dt: number): void;
    _updateSourceNodes(): boolean;
    _update(dt: number): void;
    /**
     * Destroy all nodes in the graph and reset the timeline. After calling this any created nodes will be unusable.
     */
    reset(): void;
    _deprecate(msg: string): void;
    static get DEFINITIONS(): {
        AAF_VIDEO_SCALE: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                scaleX: {
                    type: string;
                    value: number;
                };
                scaleY: {
                    type: string;
                    value: number;
                };
                bColor: {
                    type: string;
                    value: number[];
                };
            };
            inputs: string[];
        };
        CROSSFADE: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                mix: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        DREAMFADE: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                mix: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        HORIZONTAL_WIPE: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                mix: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        VERTICAL_WIPE: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                mix: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        RANDOM_DISSOLVE: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                mix: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        STATIC_DISSOLVE: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                mix: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        STATIC_EFFECT: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                weight: {
                    type: string;
                    value: number[];
                };
                amount: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        TO_COLOR_AND_BACK: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                mix: {
                    type: string;
                    value: number;
                };
                color: {
                    type: string;
                    value: number[];
                };
            };
            inputs: string[];
        };
        STAR_WIPE: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                mix: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        }; /**
         * Video Context States
         * @readonly
         * @typedef {Object} STATE
         * @property {number} STATE.PLAYING - All sources are active
         * @property {number} STATE.PAUSED - All sources are paused
         * @property {number} STATE.SEEKING - VideoContext is currently seeking to a new currentTime.
         * @property {number} STATE.STALLED - One or more sources is unable to play
         * @property {number} STATE.ENDED - All sources have finished playing
         * @property {number} STATE.BROKEN - The render graph is in a broken state
         */
        COMBINE: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                a: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        COLORTHRESHOLD: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                a: {
                    type: string;
                    value: number;
                };
                colorAlphaThreshold: {
                    type: string;
                    value: number[];
                };
            };
            inputs: string[];
        };
        MONOCHROME: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                inputMix: {
                    type: string;
                    value: number[];
                };
                outputMix: {
                    type: string;
                    value: number[];
                };
            };
            inputs: string[];
        };
        HORIZONTAL_BLUR: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                blurAmount: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        VERTICAL_BLUR: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                blurAmount: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        AAF_VIDEO_CROP: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                cropLeft: {
                    type: string;
                    value: number;
                };
                cropRight: {
                    type: string;
                    value: number;
                };
                cropTop: {
                    type: string;
                    value: number;
                };
                cropBottom: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        AAF_VIDEO_POSITION: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                positionOffsetX: {
                    type: string;
                    value: number;
                };
                positionOffsetY: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        AAF_VIDEO_FLIP: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {};
            inputs: string[];
        };
        AAF_VIDEO_FLOP: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {};
            inputs: string[];
        };
        OPACITY: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                opacity: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
        CROP: {
            title: string;
            description: string;
            vertexShader: string;
            fragmentShader: string;
            properties: {
                x: {
                    type: string;
                    value: number;
                };
                y: {
                    type: string;
                    value: number;
                };
                width: {
                    type: string;
                    value: number;
                };
                height: {
                    type: string;
                    value: number;
                };
            };
            inputs: string[];
        };
    };
    static get NODES(): {
        AudioNode: typeof AudioNode;
        CanvasNode: typeof CanvasNode;
        ImageNode: typeof ImageNode;
        MediaNode: typeof MediaNode;
        SourceNode: typeof SourceNode;
        VideoNode: typeof VideoNode;
        HLSAudioNode: typeof HLSAudioNode;
        HLSVideoNode: typeof HLSVideoNode;
    };
    /**
     * Get a JS Object containing the state of the VideoContext instance and all the created nodes.
     */
    snapshot(): {
        nodes: Record<string, any>;
        videoContext: {
            currentTime: number;
            duration: number;
            state: number;
            playbackRate: number;
        };
    };
}
