/**
 * Demuxer Interface - Abstraction for MP4 demuxing
 * 
 * This interface defines the contract for demuxing video files,
 * allowing us to swap implementations (mp4box.js, FFmpeg WASM, etc.)
 * without changing the decoder/worker logic.
 */

/**
 * Encoded video packet from the demuxer
 */
export interface EncodedPacket {
  /** Raw encoded data (H.264, VP9, AV1, etc.) */
  data: Uint8Array;
  
  /** Timestamp in microseconds */
  timestampUs: number;
  
  /** Whether this is a keyframe (I-frame) */
  key: boolean;
  
  /** Duration in microseconds (optional) */
  durationUs?: number;
}

/**
 * Track information from the MP4 container
 */
export interface TrackInfo {
  /** Codec string (e.g., 'avc1.4d401f' for H.264) */
  codec: string;
  
  /** Timescale from the MP4 track */
  timescale: number;
  
  /** Frames per second (if available) */
  fps?: number;
  
  /** Video width */
  width?: number;
  
  /** Video height */
  height?: number;
  
  /** Total duration in seconds */
  durationSec?: number;
}

/**
 * Keyframe index entry for fast seeking
 */
export interface KeyframeEntry {
  /** Time in seconds */
  timeSec: number;
  
  /** Sample number in the MP4 file */
  sample: number;
}

/**
 * Demuxer interface
 * 
 * Implementations must handle:
 * - Fetching and parsing MP4 files
 * - Building keyframe indexes for seeking
 * - Providing encoded packets for decoding
 */
export interface Demuxer {
  /**
   * Initialize the demuxer with a video source
   * @param src - URL or path to the video file
   */
  init(src: string): Promise<void>;
  
  /**
   * Get track information (codec, timescale, fps, dimensions)
   */
  getTrackInfo(): TrackInfo;
  
  /**
   * Build an index of all keyframes for fast seeking
   * Must be called after init() and before seeking
   */
  buildKeyframeIndex(): Promise<KeyframeEntry[]>;
  
  /**
   * Seek to the nearest keyframe at or before the target time
   * @param timeSec - Target time in seconds
   */
  seekToKeyframeAtOrBefore(timeSec: number): Promise<void>;
  
  /**
   * Read the next batch of encoded packets
   * @param max - Maximum number of packets to read
   * @returns Array of encoded packets (may be less than max if EOF)
   */
  readNextPackets(max: number): Promise<EncodedPacket[]>;
  
  /**
   * Check if end of file has been reached
   */
  isEOF(): boolean;
  
  /**
   * Clean up resources
   */
  close(): Promise<void>;
}

