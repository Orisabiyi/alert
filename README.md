# Alert — instant settlement

A design-engineering study: a payments microsite where the motion is
**pointer-driven rather than scroll-driven**. Nothing here fires on a scroll
trigger — every animation responds continuously to what you do with your hands.

Built by David Orisabiyi.

## The idea

"Instant settlement" argued in prose is a claim. A payment you can physically
throw across a gap and watch land is a demonstration. So the two central
interactions are both throws: the headline itself is a physics world, and the
product's core promise is a card you fling into an account.

## Stack

| | |
|---|---|
| Framework | Next.js 15, App Router, React 19 |
| Language | TypeScript, strict |
| Styling | Tailwind CSS v4 (`@theme` tokens, no config file) |
| Physics | Hand-written — `lib/physics.ts` |
| Assets | Real `.svg` files in `/public`, served via `next/image` |

## Getting started

```bash
pnpm install
pnpm dev
```

## The headline is a physics world

`components/hero/ThrowableHeadline.tsx` + `lib/physics.ts`

Every character in **MONEY / THAT LANDS / BEFORE / THEY LEAVE** is a rigid body.
Grab one and throw it; it collides with the others, bounces off the walls, and
piles up on the floor. Press **PUT IT BACK** and the letters spring into
typographic position.

- **Semi-implicit Euler** integration, fixed max timestep so a slow frame can't
  tunnel a body through a wall.
- **AABB collision** with impulse separation along the axis of least
  penetration; mass is derived from glyph area, so `M` shoves `Y` around.
- **Resting positions are measured, not hardcoded.** A hidden layout pass
  renders the real text, and `getBoundingClientRect` supplies each body's home
  coordinates — so the headline reflows correctly at any viewport width, and a
  `ResizeObserver` re-measures when the world is at rest.
- **The DOM is written directly** in the rAF loop via `style.transform`, not
  through React state. 40+ bodies at 60fps through `setState` would be a
  re-render storm.
- **Accessibility:** the real `<h1>` text is in an `sr-only` span; the letter
  bodies are `aria-hidden`. Under `prefers-reduced-motion` the physics never
  mounts and a plain static headline renders instead.

## Motion inventory

| Interaction | Mechanism |
|---|---|
| Throwable headline | Custom rigid-body sim, pointer capture, velocity sampling |
| Payment throw | Spring + momentum; release judged on displacement **or** velocity |
| Ledger tilt | Pointer-tracked 3D rotation, sprung on both axes |
| Magnetic buttons | Cursor attraction, inner label trailing at 0.3× for parallax |
| Volume dial | Drag-to-set with sprung fill; full keyboard slider semantics |
| Marquee | CSS keyframe, duplicated list, −50% translate |

One `useSpring` hook — force, damping, mass integrated per frame — drives every
non-physics motion, so the whole interface obeys a single set of laws.

## Assets

All imagery is a real file, none inlined:

```
public/
  brand/mark.svg
  icons/     arrow-right · bolt · bank · card · clock · phone
  textures/  noise · hatch · rule-grid
```

`noise.svg` is an `feTurbulence` grain laid over the paper ground at
`mix-blend-mode: multiply` — it's what stops the background reading as flat
digital beige.

## Design system

Neo-brutalism, committed rather than sampled:

- **Four colours with four jobs** — acid lime, cobalt, vermillion, warm paper.
  Not one accent on neutral.
- **Zero-blur shadows.** Every shadow is `Npx Npx 0`. Buttons drop from 6px to
  2px on `:active`, so they physically depress.
- **Nothing rounded.** No `border-radius` anywhere in the project.
- **Deliberate off-axis.** Stat cards sit at ±0.7° and snap straight on hover;
  highlight spans rotate a degree or two inside the headline.
- **Archivo Black** at `-0.045em` / `0.86` line-height — too tight and too big
  on purpose.

## Structure

```
app/            layout · page · globals.css
components/
  hero/         ThrowableHeadline
  interactive/  ThrowStage · VolumeDial · Ledger
  layout/       Header · Footer
  ui/           MagneticButton · Marquee · Stat · Icon
hooks/          useSpring · usePrefersReducedMotion
lib/            physics · format
public/         brand · icons · textures
```

---

*Alert is a fictional product. All content written for this design study.*
