# MASTER SPEC — "Graffiti Editorial" Transition Film (About master)

Approved 2026-07-07 via /df-deep-plan interview. This is the atomic,
frame-by-frame source of truth for ALL transition clips. PROMPTS.md is the
older loose pack — where they conflict, THIS file wins.

---

# ROLE
You are a film director + graffiti art director recreating a 5-second brand film
for fiez.dev. You follow this spec to the letter — every beat, color, and drip is
specified. Where the model needs interpretation, bias toward FASHION-EDITORIAL
calm, never sports-ad aggression.

# OBJECTIVE
One 5s clip (master = About page), in two cuts (UNDERLAY + HERO), desktop 16:9 —
so precisely specified it could be animated frame by frame.

# SUBJECT (locked reference)
Thai man ~30, short black hair, light stubble — EXACTLY the person in the
attached reference photo + start frame. Wardrobe locked: gray overshirt, white
tee, beige tapered pants, white sneakers. Relaxed editorial confidence — soft
jaw, calm eyes. NEVER athletic-aggressive posing.

# STAGE
Warm cream-white studio void (#FAFAF9), soft stone-gray contact shadow under him,
one soft directional beam from top-right (barely visible, editorial). Subtle film
grain (~10%). No walls, no horizon line, no props.

# BEAT MAP — second by second (t in seconds)
```
t0.0–1.0  CALM. He stands at the RIGHT THIRD (never crosses center-left all
          clip), weight on back foot, looking slightly down. At t0.6 his chin
          begins rising. Camera: slow dolly-in begins (total +8% over 5s).
t1.0      PASSION slams in, upper-left airspace, size XL.
          SLAM MECHANIC (every word): word appears at full form with a ring of
          6–10 BLACK ink droplets ejecting outward (ring gone by +0.4s) + a fine
          GOLD paint-mist puff (+0.1s). From +0.5s, 2–3 BLACK drips run down
          5–15cm from letter bottoms over ~1.5s, then freeze.
t1.4      CREATE, mid-left, size L.
t1.8      BUILD, upper-mid-left, size XL.
t2.2      CRAFT, lower-mid-left, size M.
t2.5      He raises his RIGHT hand slowly to chest height, palm open —
          as if summoning; the already-placed words drift 2–3% toward
          alignment (subtle, elegant — not a swirl).
t2.6      STORY, mid-left lower, size L.
t3.0      DESIGN, center-left, size XXL (largest).
t3.0–3.5  All 6 words settle into a loose editorial grid filling the LEFT 2/3
          airspace. NO word ever overlaps his face/head zone. Drips finish.
t3.5      He lifts chin fully — quiet pride, eyes to camera. Holds.
t3.5–5.0  GOLDEN WASH: scene overexposes gradually from the word-zone outward
          into clean golden-white (#FDE68A → white). By t5.0 fully washed.
```

# TYPOGRAPHY DNA (all 6 words, ALL-CAPS, each exactly once, correct spelling)
- Letterform: BLOCKBUSTER graffiti — thick chunky block caps, 5° forward lean
- Fill: vertical gradient per letter #EAB308 (top) → #FBBF24 → #CA8A04 (bottom)
- Outline: thin #1A1A1A keyline
- Drips: BLACK (#1A1A1A) only, from letter bottoms  ← explicit user ruling
- Splatter ring: BLACK droplets; mist puff: gold
- Texture: matte spray-paint surface, slightly rough edges — NOT metallic foil

# PALETTE (hard limits)
Background cream #FAFAF9 family only · letters gold family (#EAB308/#FBBF24/
#CA8A04) · drips/splatter/keyline #1A1A1A · wash #FDE68A→white ·
NO blue, pink, green, purple anywhere.

# VIBE
Fashion editorial × street: SSENSE/Vogue meets graffiti. Slow, moody, precise.
Confidence whispered, not shouted.

# CUTS
UNDERLAY CUT (site transition, plays at 22% opacity under UI):
  composition exactly as above — words left 2/3, him right third, high contrast.
HERO CUT (social/reel):
  same choreography; after the wash completes (t4.6), a small handstyle spray
  tag "FIEZ.DEV" writes on bottom-right over the wash, black ink, ~1s.
  (Generate as 6s if duration allows, else tag replaces final 0.5s.)

# MOBILE 9:16 (derive after desktop approval)
He stands lower-third bottom-center-right, waist-up scale; the 6 words stack in
the tall airspace ABOVE him, same metronome/beats; start frame = mobile cleared
canvas; prefer him already present at t0 over entering frame.

# DERIVATION RULE (other pages = same film, different words)
| Page | Word set (from the home cloud list) |
|---|---|
| About | PASSION CREATE STORY DREAM VISION ART |
| Skill | CODE LOGIC PIXEL MOTION SYSTEM PRECISION |
| Projects | BUILD CRAFT LAUNCH SHIP SCALE IMPACT |
| Contact | CONNECT SPARK IDEA VALUE HARMONY FLOW |

Master template render uses the proven set: PASSION CREATE BUILD CRAFT STORY
DESIGN. Everything else identical: choreography, colors, physics, vibe.

# GENERATION PROCEDURE (Higgsfield CLI)
```
model seedance_2_0 · 1080p · 16:9 (mobile 9:16) · 5s · no audio · mode std
--start-image docs/df-deep-build/portfolio-video-transitions/start-frames/main-cleared-desktop.png
  (mobile: main-cleared-mobile.png)
+ face/identity reference photo attached every run
2–3 takes per cut; judge against REJECT GATES; compress keepers:
ffmpeg -i in.mp4 -c:v libx264 -crf 26 -preset veryslow -movflags +faststart -an out.mp4
→ public/videos/transitions/{page}-{desktop|mobile}.mp4
```

# REJECT GATES (any hit = discard take)
1. Face/wardrobe drifts from reference
2. Word misspelled, extra, or repeated (test clip's CREATE×3 = fail)
3. Palette drift (any cool cast; non-black drips; non-gold letters)
4. Composition break (he crosses center-left; any word over his face)

# SUCCESS
A take passing all 4 gates, reading clearly at 22% opacity under the page,
feeling like the site's gold headings came alive as street art — calm, premium,
unmistakably him.
