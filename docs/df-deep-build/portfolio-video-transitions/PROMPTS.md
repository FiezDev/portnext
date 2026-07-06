# Hero Video Transitions — Higgsfield Prompt Pack

Generate 8 clips (4 destinations × desktop/mobile) in the **Higgsfield unlimit UI**, Seedance 2.0.
Technique from "The One-Prompt Website Pack": one consistent character reference across all clips,
start-frame pinned to the site's cleared canvas so the cut from UI → video is invisible.

## Setup (once)

| What | Value |
|---|---|
| Model | Seedance 2.0 |
| Resolution | 1080p, **no audio** |
| Duration | 5s (shortest offered ≥4s) |
| Aspect | 16:9 for `-desktop`, 9:16 for `-mobile` |
| Start image | `start-frames/main-cleared-desktop.png` (16:9) / `start-frames/main-cleared-mobile.png` (9:16) — attach to EVERY clip |
| Character reference | a clear front-facing photo of you in the SAME outfit as the portrait (gray overshirt + white tee). Attach to every clip so your face/wardrobe stays identical |

**Palette lock** (already baked into every prompt below): warm cream-white studio void,
soft stone shadows, amber-gold accents, subtle film grain, soft daylight, minimal editorial look.

Every clip ENDS in a bright golden-white wash — the player fades out on it, hiding the seam
into the destination page.

---

## 01 — Main → About  (`about-desktop.mp4`)

> The man from the reference image stands at the right side of a warm cream-white studio void, exactly as in the start frame. He turns from the camera and walks calmly into a sunlit minimal room that fades in around him: a wooden desk, soft window light, floating gold-framed photographs drifting gently in the air. Warm amber glow, soft stone shadows, subtle film grain, minimal editorial aesthetic. Smooth cinematic dolly following him, one continuous shot, no cuts. The scene gradually overexposes into a bright golden-white wash at the end. No text, no captions, no watermark.

### `about-mobile.mp4` (9:16, mobile start frame)

> An empty warm cream-white studio void, exactly as in the start frame. The man from the reference image steps in from the right edge and walks toward a sunlit minimal room forming around him: wooden desk, soft window light, gold-framed photographs floating gently. Warm amber glow, subtle film grain, minimal editorial aesthetic. Vertical composition, smooth cinematic dolly, one continuous shot, no cuts. The scene gradually overexposes into a bright golden-white wash at the end. No text, no captions, no watermark.

## 02 — Main → Skill  (`skill-desktop.mp4`)

> The man from the reference image stands at the right side of a warm cream-white studio void, exactly as in the start frame. Dozens of small glowing amber-gold glyphs and geometric tool shapes materialize and orbit slowly around him like a constellation. He raises one hand and the glyphs align into neat horizontal rows, glowing brighter. Warm cream background, soft stone shadows, subtle film grain, minimal editorial aesthetic. Slow cinematic push-in, one continuous shot, no cuts. The aligned glyphs flare and the scene overexposes into a bright golden-white wash at the end. No text, no captions, no watermark.

### `skill-mobile.mp4` (9:16, mobile start frame)

> An empty warm cream-white studio void, exactly as in the start frame. The man from the reference image steps in from below-frame; small glowing amber-gold glyphs and geometric shapes materialize and orbit him like a constellation. He raises a hand and they align into neat vertical columns, glowing brighter. Warm cream background, subtle film grain, minimal editorial aesthetic. Vertical composition, slow cinematic push-in, one continuous shot, no cuts. The glyphs flare and the scene overexposes into a bright golden-white wash. No text, no captions, no watermark.

## 03 — Main → Projects  (`projects-desktop.mp4`)

> The man from the reference image stands at the right side of a warm cream-white studio void, exactly as in the start frame. He walks left through a bright minimal gallery that forms around him: large floating screens in thin gold frames showing softly glowing abstract app dashboards, hovering along cream walls. The camera dollies sideways past the screens as he walks. Warm amber accents, soft stone shadows, subtle film grain, minimal editorial aesthetic. One continuous tracking shot, no cuts. The last screen's glow expands and overexposes the scene into a bright golden-white wash. No text on screens, no captions, no watermark.

### `projects-mobile.mp4` (9:16, mobile start frame)

> An empty warm cream-white studio void, exactly as in the start frame. The man from the reference image walks in from the left; tall floating screens in thin gold frames appear one after another beside him, showing softly glowing abstract app interfaces. Camera tracks upward slightly as he passes them. Warm amber accents, subtle film grain, minimal editorial aesthetic. Vertical composition, one continuous tracking shot, no cuts. The final screen's glow expands into a bright golden-white wash. No text on screens, no captions, no watermark.

## 04 — Main → Contact  (`contact-desktop.mp4`)

> The man from the reference image stands at the right side of a warm cream-white studio void, exactly as in the start frame. He folds a sheet of paper into a golden paper plane, smiles slightly, and throws it toward the camera. The plane glides leaving a trail of warm amber light particles that swirl across the frame. Warm cream background, soft stone shadows, subtle film grain, minimal editorial aesthetic. Smooth cinematic shot, one continuous take, no cuts. The gold light trail fills the frame and overexposes into a bright golden-white wash. No text, no captions, no watermark.

### `contact-mobile.mp4` (9:16, mobile start frame)

> An empty warm cream-white studio void, exactly as in the start frame. The man from the reference image steps in from the right holding a golden paper plane, and throws it upward toward the camera. The plane leaves a swirling trail of warm amber light particles filling the vertical frame. Warm cream background, subtle film grain, minimal editorial aesthetic. Vertical composition, one continuous take, no cuts. The gold light trail overexposes into a bright golden-white wash. No text, no captions, no watermark.

---

## After generating — compress & install

```bash
# per clip (~90% smaller, streams instantly)
ffmpeg -i in.mp4 -c:v libx264 -crf 27 -preset veryslow -movflags +faststart -an -vf scale=1920:-2 out.mp4   # desktop
ffmpeg -i in.mp4 -c:v libx264 -crf 27 -preset veryslow -movflags +faststart -an -vf scale=1080:-2 out.mp4   # mobile
```

Drop the 8 files here (exact names):

```
public/videos/transitions/
  about-desktop.mp4    about-mobile.mp4
  skill-desktop.mp4    skill-mobile.mp4
  projects-desktop.mp4 projects-mobile.mp4
  contact-desktop.mp4  contact-mobile.mp4
```

Player behavior: leaving Main → word cloud + text fade ~1s (portrait stays) → clip plays
(capped 2.5s, click/Esc skips) → golden wash → destination page. Missing file / reduced-motion /
non-Main navs = existing slide transition. Nothing breaks while clips aren't there yet.

## Tips (from the pack)

- Generate 2–3 takes of each DESKTOP clip first; keep the take where your face/wardrobe
  stays consistent through the whole move. Mobile versions after you like the desktop set.
- Consistency beats beauty: same outfit + same reference photo on every generation.
- If the UI offers an "end frame" slot, leave it empty — the golden wash ending is prompted.
