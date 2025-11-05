/**
 * WebCodecsVideoNode - Frame-perfect video source using WebCodecs API
 * 
 * © George Good, 2025
 * Based on VideoContext architecture by Matthew Shotton, BBC R&D
 * 
 * This node provides frame-accurate video playback using the WebCodecs API
 * instead of HTML5 video elements, enabling:
 * - Frame-perfect pause (no blur/wobble)
 * - Frame-by-frame stepping
 * - Faster seek performance (<50ms vs ~200ms)
 * - No paint lag during scrubbing
 * 
 * Demuxer: mp4box.js (lightweight, ~200KB)
 * Decoder: WebCodecs VideoDecoder
 * Rendering: Canvas2D (VideoFrame → canvas)
 */

import { SourceNode } from "../sourcenode";
import { updateTexture } from "../../utils";
import RenderGraph from "../../rendergraph";
import { Mp4boxDemuxer } from "./mp4-demuxer";
import { seekToExactTime, snapToFrameBoundary } from "./seek-handler";
import { renderVideoFrameToCanvas } from "./canvas-renderer";

const TYPE = "WebCodecsVideoNode";

interface BufferedFrame {
    frame: VideoFrame;
    timestampSec: number;
}

/**
 * WebCodecsVideoNode - Extends SourceNode to provide WebCodecs-based video playback
 * 
 * Unlike traditional VideoNode which wraps HTMLVideoElement, this node:
 * 1. Uses mp4box.js to demux the MP4 container
 * 2. Uses WebCodecs VideoDecoder to decode frames
 * 3. Renders VideoFrames to a canvas
 * 4. Updates the VideoContext texture from the canvas
 */
class WebCodecsVideoNode extends SourceNode {
    private demuxer: Mp4boxDemuxer;
    private decoder: VideoDecoder | null = null;
    private canvas: HTMLCanvasElement | OffscreenCanvas;
    private frameBuffer: BufferedFrame[] = [];
    private currentFrame: VideoFrame | null = null;
    private fps: number = 30;
    private isInitialized: boolean = false;
    private pendingSeek: number | null = null;

    /**
     * Initialize a WebCodecsVideoNode
     * 
     * @param src - Video URL or path
     * @param gl - WebGL2 rendering context
     * @param renderGraph - The render graph this node belongs to
     * @param currentTime - Current playback time
     */
    constructor(
        src: string,
        gl: WebGL2RenderingContext,
        renderGraph: RenderGraph,
        currentTime: number
    ) {
        super(src, gl, renderGraph, currentTime);
        
        this._displayName = TYPE;
        this.demuxer = new Mp4boxDemuxer();
        
        // Create canvas for rendering VideoFrames
        if (typeof OffscreenCanvas !== 'undefined') {
            this.canvas = new OffscreenCanvas(1920, 1080);
        } else {
            this.canvas = document.createElement('canvas');
            this.canvas.width = 1920;
            this.canvas.height = 1080;
        }
        
        // Start initialization
        this._load().catch(error => {
            console.error('[WebCodecsVideoNode] Failed to initialize:', error);
            this._state = 5; // error state
        });
    }

    /**
     * Load and initialize the video
     */
    private async _load(): Promise<void> {
        if (!this._elementURL || typeof this._elementURL !== 'string') {
            throw new Error('[WebCodecsVideoNode] Invalid source URL');
        }

        console.log('[WebCodecsVideoNode] Loading:', this._elementURL);

        try {
            // Initialize demuxer
            await this.demuxer.init(this._elementURL);
            
            // Build keyframe index for seeking
            await this.demuxer.buildKeyframeIndex();
            
            // Get track info
            const trackInfo = this.demuxer.getTrackInfo();
            console.log('[WebCodecsVideoNode] Track info:', trackInfo);
            
            // Update canvas size
            if (trackInfo.width && trackInfo.height) {
                this.canvas.width = trackInfo.width;
                this.canvas.height = trackInfo.height;
            }
            
            // Update FPS
            if (trackInfo.fps) {
                this.fps = trackInfo.fps;
            }
            
            // Create VideoDecoder
            this.decoder = new VideoDecoder({
                output: (frame: VideoFrame) => {
                    this._handleDecodedFrame(frame);
                },
                error: (error: DOMException) => {
                    console.error('[WebCodecsVideoNode] Decoder error:', error);
                }
            });
            
            // Configure decoder
            this.decoder.configure({
                codec: trackInfo.codec,
                codedWidth: trackInfo.width || 1920,
                codedHeight: trackInfo.height || 1080
            });
            
            this.isInitialized = true;
            this._ready = true;
            this._loadCalled = true;
            
            console.log('[WebCodecsVideoNode] Initialized successfully');
            
        } catch (error) {
            console.error('[WebCodecsVideoNode] Failed to load:', error);
            throw error;
        }
    }

    /**
     * Handle decoded frame from VideoDecoder
     */
    private _handleDecodedFrame(frame: VideoFrame): void {
        const timestampSec = frame.timestamp / 1_000_000;
        
        // Add to buffer
        this.frameBuffer.push({
            frame,
            timestampSec
        });
        
        // Keep buffer small (~1 second of frames)
        const maxBufferSize = Math.ceil(this.fps * 1);
        while (this.frameBuffer.length > maxBufferSize) {
            const old = this.frameBuffer.shift();
            if (old && old.frame !== this.currentFrame) {
                old.frame.close();
            }
        }
    }

    /**
     * Find closest buffered frame to target time
     */
    private _findClosestFrame(targetSec: number): BufferedFrame | null {
        if (this.frameBuffer.length === 0) return null;
        
        let closest = this.frameBuffer[0];
        let closestDiff = Math.abs(closest.timestampSec - targetSec);
        
        for (const buffered of this.frameBuffer) {
            const diff = Math.abs(buffered.timestampSec - targetSec);
            if (diff < closestDiff) {
                closest = buffered;
                closestDiff = diff;
            }
        }
        
        return closest;
    }

    /**
     * Seek to specific time with frame accuracy
     */
    private async _seekToTime(timeSec: number): Promise<void> {
        if (!this.decoder || !this.isInitialized) {
            // Store pending seek for after initialization
            this.pendingSeek = timeSec;
            return;
        }

        console.log(`[WebCodecsVideoNode] Seeking to ${timeSec}s`);
        
        // Snap to frame boundary
        const targetTime = snapToFrameBoundary(timeSec, this.fps);
        
        // Clear current frame
        if (this.currentFrame) {
            this.currentFrame.close();
            this.currentFrame = null;
        }
        
        // Clear buffer
        for (const buffered of this.frameBuffer) {
            buffered.frame.close();
        }
        this.frameBuffer = [];
        
        // Perform frame-accurate seek
        const result = await seekToExactTime(
            this.demuxer,
            this.decoder,
            {
                targetSec: targetTime,
                toleranceFrames: 0.5,
                maxDecodeAttempts: 400,
                fps: this.fps
            },
            (target, tolerance) => {
                // Check if we have a frame within tolerance
                return this.frameBuffer.some(buffered =>
                    Math.abs(buffered.timestampSec - target) <= tolerance
                );
            }
        );
        
        if (!result.success) {
            console.warn('[WebCodecsVideoNode] Seek failed:', result.error);
        }
        
        // Find closest frame to target
        const closestFrame = this._findClosestFrame(targetTime);
        if (closestFrame) {
            this.currentFrame = closestFrame.frame;
            
            // Render to canvas
            renderVideoFrameToCanvas(this.currentFrame, this.canvas, false);
            
            console.log(`[WebCodecsVideoNode] Seek complete: ${closestFrame.timestampSec}s (target: ${targetTime}s)`);
        }
    }

    /**
     * Override _update to render WebCodecs frames
     * This is called by VideoContext's render loop
     */
    _update(currentTime: number): void {
        super._update(currentTime);
        
        // Handle pending initialization
        if (!this.isInitialized) {
            return;
        }
        
        // Handle pending seek
        if (this.pendingSeek !== null) {
            this._seekToTime(this.pendingSeek);
            this.pendingSeek = null;
        }
        
        // If playing, find and render the appropriate frame
        if (this._state === 2) { // playing state
            const targetTime = currentTime - this._startTime;
            const closestFrame = this._findClosestFrame(targetTime);
            
            if (closestFrame && closestFrame.frame !== this.currentFrame) {
                this.currentFrame = closestFrame.frame;
                renderVideoFrameToCanvas(this.currentFrame, this.canvas, false);
            }
        }
        
        // Update the WebGL texture from canvas
        if (this.canvas && this._texture) {
            updateTexture(this._gl, this._texture, this.canvas);
        }
    }

    /**
     * Override seek to use WebCodecs frame-accurate seeking
     */
    seek(time: number): void {
        if (!this.isInitialized) {
            this.pendingSeek = time;
            return;
        }
        
        this._seekToTime(time).catch(error => {
            console.error('[WebCodecsVideoNode] Seek error:', error);
        });
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        console.log('[WebCodecsVideoNode] Destroying');
        
        // Close all buffered frames
        for (const buffered of this.frameBuffer) {
            try {
                buffered.frame.close();
            } catch (error) {
                // Frame might already be closed
            }
        }
        this.frameBuffer = [];
        
        // Close current frame
        if (this.currentFrame) {
            try {
                this.currentFrame.close();
            } catch (error) {
                // Frame might already be closed
            }
            this.currentFrame = null;
        }
        
        // Close decoder
        if (this.decoder) {
            try {
                this.decoder.close();
            } catch (error) {
                // Decoder might already be closed
            }
            this.decoder = null;
        }
        
        // Close demuxer
        this.demuxer.close();
        
        super.destroy();
    }
}

export { TYPE as WEBCODECS_VIDEO_TYPE };
export default WebCodecsVideoNode;

