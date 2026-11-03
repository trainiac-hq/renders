# manifest.json

What `scripts/publish.ts` writes beside the WebPs, and what the app reads to
find a render. The files are named by their content, so they can be cached
forever; a new render is a new name, and a new manifest points at it.

```jsonc
{
  "version": 1,
  // A file's URL is base + its name.
  "base": "https://traini.ac/trains/",
  // Each view's size in points; files are 2x and 3x that.
  "views": {
    "hero": { "width": 370, "height": 80 },
    "plate": { "width": 160, "height": 90 }
  },
  // Every rendered train by name: <class>-<operator>, generic-<operator>,
  // generic-none.
  "renders": {
    "390-VT": {
      "hero": { "2x": "390-VT.hero@2x.1a2b3c4d5e.webp", "3x": "390-VT.hero@3x.6f7a8b9c0d.webp" },
      "plate": { "2x": "...", "3x": "..." }
    }
  },
  // For an operator a class isn't rendered for: the class as its first
  // operator runs it (or last ran it). Classes still drawn with stand-in
  // art (fleet.ts `needsArt`) are left out, so the app falls back to its
  // generic render for them.
  "classes": { "390": "390-VT" }
}
```

Finding a render for a class and operator, in order:

1. `renders["<class>-<operator>"]`
2. `renders[classes["<class>"]]`
3. `renders["generic-<operator>"]`
4. `renders["generic-none"]`

The renders are transparent WebP, the train standing on a soft contact
shadow, nose to the left.

## What else is exported

`scripts/export.ts --app <dir>` writes, for the app to bundle:

- `renders.generated.json`: this manifest;
- `art.generated.ts`: the classes and liveries as plain data, with their
  types, for the app's flat 2D drawing shown while a render loads or when
  it can't be fetched.

`--website <public dir>` copies the WebPs to `<public dir>/trains/`.
