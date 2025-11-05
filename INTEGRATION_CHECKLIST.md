# WebCodecs Integration Checklist

## Pre-Push Checklist

Before pushing to GitHub, verify:

- [ ] All files copied from `/tmp/videocontext-fork/`
- [ ] `package.json` has `mp4box` dependency
- [ ] `yarn install` completed successfully
- [ ] `yarn build` completed without errors
- [ ] `yarn test-unit` passes
- [ ] No TypeScript errors in `src/SourceNodes/WebCodecs/`

## Files to Commit

### New Files
```
src/SourceNodes/WebCodecs/
├── webcodecs-video-node.ts
├── mp4-demuxer.ts
├── seek-handler.ts
├── canvas-renderer.ts
├── demux-types.ts
├── decoder.ts (MPL-2.0 from Diffusion Studio)
├── buffer.ts (MPL-2.0 from Diffusion Studio)
└── index.ts

WEBCODECS_README.md
INTEGRATION_CHECKLIST.md (this file)
```

### Modified Files
```
package.json (added mp4box dependency)
```

## Git Commands

```bash
# Create feature branch
git checkout develop
git pull
git checkout -b feature/webcodecs-support

# Add files
git add src/SourceNodes/WebCodecs/
git add package.json
git add WEBCODECS_README.md
git add INTEGRATION_CHECKLIST.md

# Commit
git commit -m "feat(webcodecs): add WebCodecs source node for frame-perfect playback"

# Push
git push origin feature/webcodecs-support

# Create tag for Auto Shorts to use
git tag v99.1.0-webcodecs
git push origin v99.1.0-webcodecs
```

## Post-Push: Update Auto Shorts

1. Update `web/frontend/package.json`:
   ```json
   {
     "dependencies": {
       "videocontext": "github:G4Q95/VideoContext#v99.1.0-webcodecs"
     }
   }
   ```

2. Install:
   ```bash
   cd web/frontend
   npm install
   ```

3. Remove old prototype code:
   ```bash
   rm -rf web/frontend/src/webcodecs-decoder
   rm -rf web/frontend/src/videocontext/sources
   ```

4. Update imports to use VideoContext's WebCodecs module

5. Test:
   ```bash
   npm run e2e:long-scene-drag
   npm run e2e:long-master-drag
   ```

## Verification

- [ ] VideoContext fork pushed to GitHub
- [ ] Tag created (v99.1.0-webcodecs)
- [ ] Auto Shorts updated to use fork
- [ ] Old prototype code removed
- [ ] Tests pass (39/39 gates)
- [ ] WebCodecs works in browser
- [ ] Falls back to HTML5 correctly

## Documentation

- [ ] `WEBCODECS_README.md` reviewed
- [ ] Auto Shorts `WEBCODECS_MIGRATION_GUIDE.md` reviewed
- [ ] Team notified of new VideoContext version

