/**
 * MP4Box.js Demuxer - Lightweight MP4 demuxing using mp4box.js
 * 
 * This replaces the FFmpeg WASM demuxer from Diffusion Studio v1.x with a
 * lightweight mp4box.js implementation (~200KB vs ~30MB).
 * 
 * License: Custom implementation (not from Diffusion Studio)
 */

import MP4Box, { 
  MP4File, 
  MP4ArrayBuffer, 
  MP4Info, 
  MP4Sample, 
  MP4VideoTrack 
} from 'mp4box';
import { Demuxer, EncodedPacket, TrackInfo, KeyframeEntry } from './types/demux';

interface PendingFetch {
  resolve: () => void;
  reject: (error: Error) => void;
}

export class Mp4boxDemuxer implements Demuxer {
  private mp4boxFile: MP4File | null = null;
  private trackId: number | null = null;
  private trackInfo: TrackInfo | null = null;
  private keyframes: KeyframeEntry[] = [];
  private pendingPackets: EncodedPacket[] = [];
  private eof: boolean = false;
  private fetchAbortController: AbortController | null = null;
  private currentSampleNumber: number = 1; // MP4Box uses 1-based sample numbers
  private pendingFetch: PendingFetch | null = null;

  /**
   * Initialize the demuxer with a video source URL
   */
  async init(src: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Create MP4Box file instance
        this.mp4boxFile = MP4Box.createFile();
        
        // Set up ready callback
        this.mp4boxFile.onReady = (info: MP4Info) => {
          try {
            console.log('[mp4-demuxer] MP4 ready:', info);
            
            // Find first video track
            const videoTrack = info.videoTracks[0] as MP4VideoTrack;
            if (!videoTrack) {
              reject(new Error('No video track found in MP4'));
              return;
            }
            
            this.trackId = videoTrack.id;
            
            // Extract track information
            this.trackInfo = {
              codec: videoTrack.codec,
              timescale: videoTrack.timescale || 1000,
              fps: videoTrack.nb_samples / videoTrack.duration * videoTrack.timescale,
              width: videoTrack.track_width,
              height: videoTrack.track_height,
              durationSec: videoTrack.duration / videoTrack.timescale
            };
            
            console.log('[mp4-demuxer] Track info:', this.trackInfo);
            
            // Tell MP4Box we want samples from this track
            this.mp4boxFile!.setExtractionOptions(this.trackId, null, {
              nbSamples: 1000 // Request in batches
            });
            
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        
        // Set up sample callback
        this.mp4boxFile.onSamples = (trackId: number, user: any, samples: MP4Sample[]) => {
          if (trackId !== this.trackId) return;
          
          console.log(`[mp4-demuxer] Received ${samples.length} samples`);
          
          // Convert MP4Box samples to our EncodedPacket format
          for (const sample of samples) {
            const packet: EncodedPacket = {
              data: new Uint8Array(sample.data),
              timestampUs: Math.round((sample.cts * 1_000_000) / this.trackInfo!.timescale),
              key: sample.is_sync,
              durationUs: Math.round((sample.duration * 1_000_000) / this.trackInfo!.timescale)
            };
            
            this.pendingPackets.push(packet);
          }
          
          // Resolve pending fetch if waiting
          if (this.pendingFetch) {
            this.pendingFetch.resolve();
            this.pendingFetch = null;
          }
        };
        
        // Set up error callback
        this.mp4boxFile.onError = (error: string) => {
          console.error('[mp4-demuxer] MP4Box error:', error);
          reject(new Error(error));
        };
        
        // Fetch and stream the MP4 file
        await this.fetchAndStream(src);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Fetch MP4 file and stream it to MP4Box
   */
  private async fetchAndStream(src: string): Promise<void> {
    this.fetchAbortController = new AbortController();
    
    try {
      const response = await fetch(src, {
        signal: this.fetchAbortController.signal
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch MP4: ${response.statusText}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }
      
      // Stream chunks to MP4Box
      let offset = 0;
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          this.mp4boxFile!.flush();
          this.eof = true;
          break;
        }
        
        // MP4Box requires an ArrayBuffer with fileStart property
        const buffer = value.buffer as MP4ArrayBuffer;
        buffer.fileStart = offset;
        
        // Append to MP4Box
        offset = this.mp4boxFile!.appendBuffer(buffer);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[mp4-demuxer] Fetch aborted');
      } else {
        throw error;
      }
    }
  }

  /**
   * Get track information
   */
  getTrackInfo(): TrackInfo {
    if (!this.trackInfo) {
      throw new Error('Demuxer not initialized');
    }
    return this.trackInfo;
  }

  /**
   * Build keyframe index for fast seeking
   */
  async buildKeyframeIndex(): Promise<KeyframeEntry[]> {
    if (!this.mp4boxFile || !this.trackId) {
      throw new Error('Demuxer not initialized');
    }

    // Get all samples for the track
    const track = this.mp4boxFile.getTrackById(this.trackId);
    if (!track) {
      throw new Error('Track not found');
    }

    // Extract keyframe information
    this.keyframes = [];
    const samples = track.samples || [];
    
    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i];
      if (sample.is_sync) {
        this.keyframes.push({
          timeSec: sample.cts / this.trackInfo!.timescale,
          sample: i + 1 // MP4Box uses 1-based indexing
        });
      }
    }

    console.log(`[mp4-demuxer] Built keyframe index: ${this.keyframes.length} keyframes`);
    return this.keyframes;
  }

  /**
   * Seek to nearest keyframe at or before target time
   */
  async seekToKeyframeAtOrBefore(timeSec: number): Promise<void> {
    if (!this.mp4boxFile || !this.trackId) {
      throw new Error('Demuxer not initialized');
    }

    // Find nearest keyframe <= timeSec
    let targetKeyframe: KeyframeEntry | null = null;
    for (const kf of this.keyframes) {
      if (kf.timeSec <= timeSec) {
        targetKeyframe = kf;
      } else {
        break;
      }
    }

    if (!targetKeyframe) {
      // Seek to beginning
      this.currentSampleNumber = 1;
    } else {
      this.currentSampleNumber = targetKeyframe.sample;
    }

    // Clear pending packets (they're from the old position)
    this.pendingPackets = [];

    console.log(`[mp4-demuxer] Seeking to sample ${this.currentSampleNumber} (time: ${timeSec}s)`);

    // Tell MP4Box to start extracting from this sample
    this.mp4boxFile.setExtractionOptions(this.trackId, null, {
      nbSamples: 1000
    });
    
    // Seek the file to this sample
    this.mp4boxFile.seek(timeSec, true); // true = seek to keyframe
  }

  /**
   * Read next batch of packets
   */
  async readNextPackets(max: number): Promise<EncodedPacket[]> {
    // If we have enough packets, return them
    if (this.pendingPackets.length >= max) {
      return this.pendingPackets.splice(0, max);
    }

    // If EOF and no more packets, return what we have
    if (this.eof) {
      return this.pendingPackets.splice(0, max);
    }

    // Request more samples from MP4Box
    if (this.mp4boxFile && this.trackId) {
      // Wait for samples callback
      await new Promise<void>((resolve, reject) => {
        this.pendingFetch = { resolve, reject };
        
        // Request extraction of next batch
        try {
          this.mp4boxFile!.start();
        } catch (error) {
          reject(error);
        }
        
        // Timeout after 5 seconds
        setTimeout(() => {
          if (this.pendingFetch) {
            this.pendingFetch = null;
            resolve(); // Return whatever we have
          }
        }, 5000);
      });
    }

    // Return up to max packets
    return this.pendingPackets.splice(0, Math.min(max, this.pendingPackets.length));
  }

  /**
   * Check if end of file reached
   */
  isEOF(): boolean {
    return this.eof && this.pendingPackets.length === 0;
  }

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    // Abort fetch if in progress
    if (this.fetchAbortController) {
      this.fetchAbortController.abort();
      this.fetchAbortController = null;
    }

    // Clear pending data
    this.pendingPackets = [];
    this.keyframes = [];
    
    // Release MP4Box resources
    if (this.mp4boxFile) {
      try {
        this.mp4boxFile.stop();
      } catch (error) {
        // Ignore errors during cleanup
      }
      this.mp4boxFile = null;
    }

    this.trackId = null;
    this.trackInfo = null;
    this.eof = false;

    console.log('[mp4-demuxer] Closed');
  }
}

