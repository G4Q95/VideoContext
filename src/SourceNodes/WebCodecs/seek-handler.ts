/**
 * Seek Handler - Frame-accurate seeking for WebCodecs
 * 
 * Implements the "decode-to-target" algorithm:
 * 1. Seek demuxer to nearest keyframe <= target
 * 2. Decode frames until we have one close to target time
 * 3. Display the frame closest to target (within tolerance)
 * 
 * This achieves frame-accurate seeking without needing to decode
 * the entire video from start to target.
 */

import { Demuxer } from './types/demux';

/**
 * Frame-accurate seek configuration
 */
export interface SeekConfig {
  /** Target time in seconds */
  targetSec: number;
  
  /** Tolerance in frames (e.g., 0.5 = within half a frame) */
  toleranceFrames: number;
  
  /** Maximum decode attempts before giving up */
  maxDecodeAttempts: number;
  
  /** FPS for calculating frame boundaries */
  fps: number;
}

/**
 * Seek result information
 */
export interface SeekResult {
  /** Whether seek was successful */
  success: boolean;
  
  /** Final timestamp achieved (seconds) */
  finalTimeSec: number;
  
  /** Number of frames decoded */
  framesDecoded: number;
  
  /** Error message if failed */
  error?: string;
}

/**
 * Perform frame-accurate seek
 * 
 * @param demuxer - The MP4 demuxer
 * @param decoder - VideoDecoder instance
 * @param config - Seek configuration
 * @param hasFrameNear - Callback to check if we have a frame near target
 * @returns Seek result
 */
export async function seekToExactTime(
  demuxer: Demuxer,
  decoder: VideoDecoder,
  config: SeekConfig,
  hasFrameNear: (targetSec: number, toleranceSec: number) => boolean
): Promise<SeekResult> {
  
  const { targetSec, toleranceFrames, maxDecodeAttempts, fps } = config;
  const toleranceSec = toleranceFrames / fps;
  
  console.log(`[seek-handler] Seeking to ${targetSec}s (tolerance: ±${toleranceSec}s)`);
  
  try {
    // Step 1: Seek demuxer to nearest keyframe
    await demuxer.seekToKeyframeAtOrBefore(targetSec);
    
    // Step 2: Decode until we have a frame near target
    let framesDecoded = 0;
    let attempts = 0;
    
    while (!hasFrameNear(targetSec, toleranceSec) && attempts < maxDecodeAttempts) {
      // Read next batch of packets
      const packets = await demuxer.readNextPackets(16);
      
      if (packets.length === 0) {
        // EOF or no more packets
        if (demuxer.isEOF()) {
          console.warn('[seek-handler] Reached EOF before finding target frame');
          break;
        }
        
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
        continue;
      }
      
      // Decode packets
      for (const packet of packets) {
        try {
          const chunk = new EncodedVideoChunk({
            timestamp: packet.timestampUs,
            type: packet.key ? 'key' : 'delta',
            data: packet.data
          });
          
          decoder.decode(chunk);
          framesDecoded++;
          
        } catch (error) {
          console.warn('[seek-handler] Failed to decode chunk:', error);
        }
      }
      
      // Flush decoder to ensure frames are output
      try {
        await decoder.flush();
      } catch (error) {
        // Flush might fail if decoder is busy, that's okay
      }
      
      attempts++;
      
      // Check if we have the frame now
      if (hasFrameNear(targetSec, toleranceSec)) {
        console.log(`[seek-handler] Found target frame after ${framesDecoded} frames`);
        return {
          success: true,
          finalTimeSec: targetSec,
          framesDecoded
        };
      }
    }
    
    // If we get here, we didn't find the exact frame
    if (attempts >= maxDecodeAttempts) {
      return {
        success: false,
        finalTimeSec: targetSec,
        framesDecoded,
        error: `Max decode attempts (${maxDecodeAttempts}) exceeded`
      };
    }
    
    // EOF case
    return {
      success: false,
      finalTimeSec: targetSec,
      framesDecoded,
      error: 'Reached EOF before finding target frame'
    };
    
  } catch (error: any) {
    console.error('[seek-handler] Seek failed:', error);
    return {
      success: false,
      finalTimeSec: targetSec,
      framesDecoded: 0,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Calculate the frame boundary for a given time
 * Snaps time to the nearest frame boundary based on FPS
 * 
 * @param timeSec - Time in seconds
 * @param fps - Frames per second
 * @returns Snapped time at frame boundary
 */
export function snapToFrameBoundary(timeSec: number, fps: number): number {
  const frameDuration = 1 / fps;
  return Math.round(timeSec / frameDuration) * frameDuration;
}

/**
 * Check if a time is within tolerance of a target
 * 
 * @param actualSec - Actual time in seconds
 * @param targetSec - Target time in seconds
 * @param toleranceSec - Tolerance in seconds
 * @returns Whether time is within tolerance
 */
export function isWithinTolerance(
  actualSec: number,
  targetSec: number,
  toleranceSec: number
): boolean {
  return Math.abs(actualSec - targetSec) <= toleranceSec;
}

/**
 * Find the closest frame to a target time from a list of available frames
 * 
 * @param frames - Array of frame timestamps
 * @param targetSec - Target time in seconds
 * @returns Index of closest frame, or -1 if no frames
 */
export function findClosestFrame(frames: number[], targetSec: number): number {
  if (frames.length === 0) return -1;
  
  let closestIndex = 0;
  let closestDiff = Math.abs(frames[0] - targetSec);
  
  for (let i = 1; i < frames.length; i++) {
    const diff = Math.abs(frames[i] - targetSec);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = i;
    }
  }
  
  return closestIndex;
}

