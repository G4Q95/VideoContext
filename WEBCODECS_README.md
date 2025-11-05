# WebCodecs Integration for VideoContext

## Overview

This fork of VideoContext includes experimental WebCodecs support for frame-perfect video playback. WebCodecs provides frame-accurate seeking, pausing without blur, and faster seeking compared to traditional HTML5 video.

## Features

- ✅ **Frame-accurate pause** - No blur or wobble when paused
- ✅ **Frame-by-frame stepping** - Step through video frame-by-frame
- ✅ **Faster seeking** - Seek in <50ms vs ~200ms with HTML5 video
- ✅ **No paint lag** - Smooth scrubbing without visual lag
- ✅ **Lightweight** - Uses mp4box.js (~200KB) instead of FFmpeg WASM (~30MB)

## Browser Support

WebCodecs is supported in:
- ✅ Chrome 94+
- ✅ Edge 94+
- ✅ Safari 16.4+
- ❌ Firefox (not yet supported - auto-falls back to HTML5)

## Usage

### Creating a WebCodecs Video Node

```typescript
import VideoContext from 'videocontext';
import { WebCodecsVideoNode, isWebCodecsSupported } from 'videocontext/dist/SourceNodes/WebCodecs';

const canvas = document.getElementById('canvas');
const ctx = new VideoContext(canvas);

// Check if WebCodecs is supported
if (isWebCodecsSupported()) {
    // Create WebCodecs node directly
    const videoNode = new WebCodecsVideoNode(
        './video.mp4',
        ctx._gl,
        ctx._renderGraph,
        ctx.currentTime
    );
    
    videoNode.start(0);
    videoNode.stop(10);
    videoNode.connect(ctx.destination);
} else {
    // Fall back to regular VideoNode
    const videoNode = ctx.video('./video.mp4');
    videoNode.start(0);
    videoNode.stop(10);
    videoNode.connect(ctx.destination);
}

ctx.play();
```

### Automatic WebCodecs Detection (Recommended)

For easier integration, you can extend VideoContext to automatically use WebCodecs when available:

```typescript
import VideoContext from 'videocontext';
import { WebCodecsVideoNode, isWebCodecsSupported } from 'videocontext/dist/SourceNodes/WebCodecs';

class EnhancedVideoContext extends VideoContext {
    video(src: string, sourceOffset?: number, preloadTime?: number, videoElementAttributes?: any) {
        // Use WebCodecs if supported, otherwise fall back to HTML5
        if (isWebCodecsSupported()) {
            const node = new WebCodecsVideoNode(
                src,
                this._gl,
                this._renderGraph,
                this.currentTime
            );
            this._sourceNodes.push(node);
            return node;
        }
        
        // Fall back to regular video node
        return super.video(src, sourceOffset, preloadTime, videoElementAttributes);
    }
}

// Use the enhanced context
const ctx = new EnhancedVideoContext(canvas);
const videoNode = ctx.video('./video.mp4'); // Automatically uses WebCodecs if available
```

## Architecture

### Components

1. **WebCodecsVideoNode** (`webcodecs-video-node.ts`)
   - Extends `SourceNode` from VideoContext
   - Manages WebCodecs decoding lifecycle
   - Renders VideoFrames to canvas
   - Updates WebGL textures

2. **Mp4boxDemuxer** (`mp4-demuxer.ts`)
   - Lightweight MP4 container parsing using mp4box.js
   - Builds keyframe indexes for fast seeking
   - Streams encoded packets to the decoder

3. **Seek Handler** (`seek-handler.ts`)
   - Frame-accurate "decode-to-target" algorithm
   - Seeks to nearest keyframe, then decodes to exact frame
   - Achieves <1 frame accuracy

4. **Canvas Renderer** (`canvas-renderer.ts`)
   - Renders VideoFrames to canvas
   - Handles frame lifecycle (closing frames to prevent leaks)

5. **Decoder & Buffer** (`decoder.ts`, `buffer.ts`)
   - From Diffusion Studio v1.x (MPL-2.0 license)
   - Manages WebCodecs VideoDecoder
   - Buffers decoded frames

## Dependencies

- **mp4box.js** (^0.5.2) - MP4 container parsing

## Known Limitations

1. **Container Format**: Currently only supports MP4 containers with H.264/H.265/VP9/AV1 codecs
2. **Browser Support**: Firefox does not yet support WebCodecs
3. **Audio**: WebCodecs video nodes don't handle audio (use separate audio nodes)
4. **Memory**: Buffers ~1 second of decoded frames (~30-60 frames), requires proper cleanup

## Comparison: HTML5 vs WebCodecs

| Feature | HTML5 Video | WebCodecs |
|---------|-------------|-----------|
| Pause Accuracy | ~2-3 frames blur | Exact frame, no blur |
| Seek Performance | ~200ms | <50ms |
| Frame Stepping | Not possible | Full support |
| Scrubbing | Paint lag | No lag |
| Demuxer Size | Built-in | ~200KB (mp4box.js) |
| Browser Support | Universal | Chrome, Edge, Safari |

## Credits

- **WebCodecs Implementation**: George Good (2025)
- **VideoContext Architecture**: Matthew Shotton, BBC R&D
- **Decoder/Buffer**: Diffusion Studio v1.x (MPL-2.0)
- **Demuxer**: mp4box.js

## License

- WebCodecs implementation: Same license as VideoContext (Apache-2.0)
- Decoder/Buffer components: MPL-2.0 (from Diffusion Studio v1.x)

