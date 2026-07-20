---
name: sprite-bake
description: >-
  Bake 3D character models (glTF/GLB, e.g. KayKit packs) into 2D sprite sheets —
  8-directional, animated (idle/walk/attack/…), transparent background — rendered
  headless with three.js in the pre-installed Chromium. This is how Brawl-Stars-style
  2D sprites are made from 3D source. Use this WHENEVER the task involves turning a
  .glb/.gltf/.fbx model into 2D game sprites, adding KayKit or other 3D character
  art to the Phaser game, generating directional/animated sprite sheets, or "baking",
  "pre-rendering", or "converting 3D to 2D" for Projet Nyxt — even if the user only
  drops a model zip and asks how to use it in the game.
---

# sprite-bake — 3D → 2D sprite sheets

Projet Nyxt is a 2D Phaser game, but the best-looking character art (KayKit and
similar) ships as **3D models**. Rather than render 3D live (heavy, and it fights
the 2D camera/netcode), we do what Supercell does for Brawl Stars: **pre-render
the 3D models to 2D sprite sheets** from the game's fixed 3/4 top-down angle. The
sprites then load in Phaser like any texture — gameplay, snapshots and the online
sim stay untouched, because this only swaps the cosmetic layer.

This skill renders headless via **three.js inside the pre-installed Chromium**
(software GL) — no Blender, no GPU, no extra install beyond the `three`
devDependency (already in `package.json`).

## When to reach for it
- A 3D model pack (KayKit, Quaternius, Synty, any glTF/GLB) needs to become game sprites.
- You need directional (4/8-way) and/or animated sprite sheets for a character.
- You're wiring new character art into `src/render/avatarVisual.ts`.

## How to run
From the repo root:
```bash
node .claude/skills/sprite-bake/scripts/bake.mjs <path/to/job.json>
```
It spins up a static server, drives the render page in headless Chromium, writes
one PNG sheet per animation plus a `manifest.json`, then tears everything down.
A clean run prints `✅ baked → <outDir>` with no PAGE ERRORS.

## The job file
Paths are relative to the repo root. See `tools/sprite-bake/job.barbarian.json`
for a working example. Schema:

```jsonc
{
  "pack": "kaykit-adventurers",          // label only, copied into the manifest
  "outDir": "tools/sprite-bake/out",     // where PNGs + manifest.json are written
  "size": 256,                            // px per frame cell (square)
  "dirs": 8,                              // directions baked (rows of each sheet)
  "elevDeg": 52,                          // camera pitch above the ground (the 3/4 look)
  "yawOffsetDeg": 0,                      // rotate all directions (align dir 0 to your convention)
  "azimDeg": 0,                           // camera azimuth (usually 0)
  "padding": 1.28,                        // >1 leaves margin so tall poses/heads don't clip
  "aimBias": 0.06,                        // fraction of radius to drop the aim → feet sit lower
  "animGlbs": [                           // shared-rig animation libraries (clips merged)
    "tools/kaykit-src/.../Rig_Medium_General.glb",
    "tools/kaykit-src/.../Rig_Medium_MovementBasic.glb"
  ],
  "characters": [
    {
      "name": "Barbarian",
      "glb": "tools/kaykit-src/.../Characters/gltf/Barbarian.glb",
      "clips": [
        { "name": "Idle_A",    "out": "idle", "frames": 1, "stillAt": 0.4 },
        { "name": "Walking_A", "out": "walk", "frames": 8 }
      ]
    }
  ]
}
```

- `frames: 1` → a single still (sampled at `stillAt` × clip duration, default 0.5).
- `frames: N` → N frames sampled evenly across the clip's loop (no duplicated wrap frame).
- `out` names the file: `<charname>_<out>.png`, e.g. `barbarian_walk.png`.

## Output layout
Each sheet is a grid: **rows = directions** (top→bottom = direction index 0…dirs-1),
**columns = animation frames** (left→right = time). `manifest.json` records
`cols/rows/frameW/frameH/file` per character per animation so the Phaser loader can
slice it without guessing.

## Static props (no rig, no animation)
Decorative/obstacle assets (rocks, bushes, crates…) usually have **no skin and
no animations** — `list-clips.mjs` reports `skins:0 animations:0`. The same
pipeline handles them with no code changes:
- Omit `animGlbs` (or pass `[]`).
- Give each one a single clip entry with `frames: 1` and any `name` (it won't
  match a real clip — that's fine, `renderPose` just skips animating and
  renders the static bind pose): `{ "name": "static", "out": "img", "frames": 1 }`.
- Usually `dirs: 1` — a static prop doesn't need to "face" anything the way a
  controllable character does. Get visual variety from the pack's own model
  variants (packs like KayKit Forest ship many hand-authored variants per
  category — `Rock_1_A`…`Rock_1_Q`, `Bush_1_A`…) instead of rotating one model.

**Relative-size gotcha**: the bounding-sphere framing makes EVERY bake fill the
canvas similarly, regardless of the source mesh's true size — so a pebble and
a boulder come out looking the same pixel size, and any true size difference
between two props is lost in the image alone. `manifest.json` records each
character's `radius` (the bounding-sphere radius in model units) precisely so
you can reconstruct relative scale at display time: **display scale ∝ radius**.
Pick one prop as a reference (radius → a good on-screen size for it), then
scale the others by the ratio of their radius to the reference's.

## Procedural primitives (no source model at all)
For a small simple shape (a gem/coin-style pickup, an icon), you don't need to
source a file — a character entry can use `"primitive"` instead of `"glb"` to
build the mesh directly in three.js (currently: `"gem"` = octahedron, the
classic faceted-diamond silhouette). Useful trick: bake it turning through
**many directions at `frames: 1`** (e.g. `dirs: 16`), and instead of treating
the output rows as facing-states, play them **in sequence as a looping
animation** client-side — that fakes a true 3D Y-axis spin (a genuinely
convincing "rotating collectible", far better than a flat 2D rotation tween).
```jsonc
{
  "name": "PowerGem",
  "primitive": "gem",
  "primitiveOpts": { "color": 6742271, "emissive": 805458, "stretchY": 1.3 },
  "clips": [{ "name": "spin", "out": "spin", "frames": 1 }]
}
```
(`dirs` for this job controls how many spin frames get baked — set it high,
e.g. 16–24, for a smooth loop; `primitiveOpts` colors are decimal, not hex
strings — `0x66e0ff` → `6714111`.)

## KayKit `Rig_Medium` clip reference
All KayKit "Adventurers/Skeletons/…" characters share `Rig_Medium`, so the same
animation glbs drive every character. Useful clips:

| Game action | Clip name    | From glb              |
|-------------|--------------|-----------------------|
| idle        | `Idle_A`     | Rig_Medium_General    |
| walk        | `Walking_A`  | Rig_Medium_MovementBasic |
| run         | `Running_A`  | Rig_Medium_MovementBasic |
| attack      | `Throw` / `Use_Item` | Rig_Medium_General |
| hit/flinch  | `Hit_A`      | Rig_Medium_General    |
| death       | `Death_A`    | Rig_Medium_General    |

To list clips in any glb without a 3D tool, read its glTF JSON chunk (see
`scripts/list-clips.mjs`).

## Tuning the look
- **Angle**: `elevDeg` is the whole feel. ~50–55° = Brawl-Stars top-down (lots of
  head, little face). Lower (~35–40°) shows more face, less floor. Change it once
  in the job and re-bake — it applies to every character for consistency.
- **Head/limb clipping**: raise `padding` (framing uses a rotation-invariant
  bounding-sphere fit, so a little margin covers the tallest pose in the cycle).
- **Feet placement**: `aimBias` nudges the character down in frame.
- **Direction count**: 8 looks best; drop to 4 to quarter the asset size if needed.

## Integrating the baked sheets into the game
1. Copy/point the PNGs into the game's asset path and `this.load.spritesheet(...)`
   each with `{ frameWidth, frameHeight }` from the manifest.
2. In `src/render/avatarVisual.ts` add a **sprite-backed** variant that picks the
   row from the entity's facing (map movement/aim angle → direction index, honoring
   `yawOffsetDeg`) and plays the frame columns as a Phaser anim. Keep the existing
   overlays (shadow, health bar, ult glow) drawn on top, and **fall back to the
   vector avatar** for any Zarek not yet baked so nothing breaks mid-migration.
3. Because the sim is authoritative and snapshot-driven, this is purely visual —
   do not touch `MatchSim` or the netcode.

## Not just KayKit
Any glTF/GLB with a skeleton works. If a model embeds its own animations, pass its
own file in `animGlbs`. If the skeleton differs from the animation library's, the
clips must share bone names to retarget for free (that's the whole point of a
shared rig like `Rig_Medium`).
