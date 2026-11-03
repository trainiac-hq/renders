# Rendered

The final render of every train as of 2026-10-06, copied from `out/` so it survives without a re-render.

Per train (`<class>-<operator>`, 147 of them):

- `-hero.png`, `-plate.png`: the two published views, full size
- `-ids.png`: the part-id pass the validator reads
- `-hero.camera.json`, `-plate.camera.json`: the camera each view used
- `-validate.json`: the validator's report for that render
- `.inputs`: hash of everything the render was made from; `render-all.ts`
  skips a train whose hash still matches

`publish/` is what `scripts/publish.ts` made from them: the WebPs at 2x and
3x, `manifest.json` and its `cache.json`.

To use these instead of rendering, copy them back to where the scripts look:

```bash
mkdir -p out/renders out/publish
cp rendered/*.png rendered/*.json rendered/*.inputs out/renders/
cp -R rendered/publish/. out/publish/
```
