/**
 * Canvas Renderer - Utility for rendering VideoFrames to canvas
 * 
 * Adapted from Diffusion Studio v1.x (MPL-2.0)
 * Original logic from: src/clips/video/video.ts
 * 
 * This utility handles the rendering of WebCodecs VideoFrames to a canvas element.
 */

/**
 * Render a VideoFrame to a canvas element
 * 
 * @param frame - The VideoFrame to render
 * @param canvas - The target canvas element
 * @param shouldClose - Whether to close the frame after rendering (default: true)
 * 
 * @remarks
 * CRITICAL: VideoFrames must be closed after use to avoid memory leaks.
 * Set shouldClose=false only if you need the frame for other purposes.
 */
export function renderVideoFrameToCanvas(
  frame: VideoFrame,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  shouldClose: boolean = true
): void {
  try {
    // Resize canvas to match frame dimensions
    canvas.width = frame.displayWidth;
    canvas.height = frame.displayHeight;
    
    // Get 2D context
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('[canvas-renderer] Failed to get 2D context');
      if (shouldClose) frame.close();
      return;
    }
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the VideoFrame (VideoFrame implements CanvasImageSource)
    context.drawImage(frame, 0, 0);
    
    // Clean up the frame to prevent memory leaks
    if (shouldClose) {
      frame.close();
    }
  } catch (error) {
    console.error('[canvas-renderer] Failed to render frame:', error);
    if (shouldClose) {
      try {
        frame.close();
      } catch (closeError) {
        // Frame might already be closed
      }
    }
  }
}

/**
 * Create a canvas element with specific dimensions
 * 
 * @param width - Canvas width
 * @param height - Canvas height
 * @param offscreen - Whether to create an OffscreenCanvas (default: false)
 * @returns Canvas element
 */
export function createCanvas(
  width: number,
  height: number,
  offscreen: boolean = false
): HTMLCanvasElement | OffscreenCanvas {
  if (offscreen && typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Extract a still frame from a VideoFrame as a Blob
 * 
 * @param frame - The VideoFrame to extract
 * @param format - Image format (default: 'image/png')
 * @param quality - Image quality 0-1 (default: 0.95)
 * @returns Promise<Blob> - The extracted image as a Blob
 */
export async function extractFrameAsBlob(
  frame: VideoFrame,
  format: string = 'image/png',
  quality: number = 0.95
): Promise<Blob> {
  // Create a temporary canvas
  const canvas = createCanvas(frame.displayWidth, frame.displayHeight, false) as HTMLCanvasElement;
  
  // Render the frame (don't close it, caller owns it)
  renderVideoFrameToCanvas(frame, canvas, false);
  
  // Convert to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to extract frame as blob'));
        }
      },
      format,
      quality
    );
  });
}

