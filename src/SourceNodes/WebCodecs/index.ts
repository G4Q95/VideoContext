/**
 * WebCodecs Module - Frame-perfect video decoding
 * 
 * This module provides WebCodecs-powered video source nodes for VideoContext.
 * 
 * Components:
 * - WebCodecsVideoNode: Main source node implementation
 * - Mp4boxDemuxer: Lightweight MP4 parsing
 * - Decoder/Buffer: From Diffusion Studio v1.x (MPL-2.0)
 * - Seek utilities: Frame-accurate seeking
 * - Canvas renderer: VideoFrame → Canvas
 */

export { default as WebCodecsVideoNode } from './webcodecs-video-node';
export { Mp4boxDemuxer } from './mp4-demuxer';
export * from './seek-handler';
export * from './canvas-renderer';
export * from './demux-types';

/**
 * Check if WebCodecs API is supported in the current browser
 */
export function isWebCodecsSupported(): boolean {
    if (typeof window === 'undefined') {
        return false; // SSR environment
    }

    return (
        typeof (window as any).VideoDecoder !== 'undefined' &&
        typeof (window as any).VideoFrame !== 'undefined' &&
        typeof (window as any).EncodedVideoChunk !== 'undefined'
    );
}

