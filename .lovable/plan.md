

## Interactive Quick Match Icon — Stump Shatter on Tap

### What it does
When the player taps the Quick Match icon, a dramatic shatter animation plays before navigating: the ball smashes into the stumps, stumps fly apart, bails spin into the air, sparks burst out — then after ~700ms the game loads.

### Shatter animation sequence
1. **Ball impact** (~200ms) — ball accelerates downward into the stumps
2. **Stumps scatter** — left stump rotates and flies left, right goes right, center launches upward — all fade out
3. **Bails fly** — both bails spin upward with rotation and fade
4. **Spark burst** — 3-4 golden particles explode from the impact point
5. **Flash glow** — brief white radial flash at the collision center
6. **Navigate** — after 700ms total, the Quick Match game mode loads

### Technical details

**New sub-component: `QuickMatchIcon`** (inside `ModeIconGrid.tsx`)
- Local `shattered` state boolean, resets after animation completes
- When `shattered` is false: shows the existing idle animation (ball bouncing down toward stumps)
- When `shattered` is true:
  - Ball snaps to impact position
  - 3 stumps each get unique `animate` props: left stump → `{ x: -15, y: 10, rotate: -35, opacity: 0 }`, right → `{ x: 15, y: 10, rotate: 35, opacity: 0 }`, center → `{ y: -20, rotate: -10, opacity: 0 }`
  - 2 bails → `{ y: -18, rotate: 180+random, opacity: 0 }`
  - 4 spark particles burst outward from center with `{ x: random, y: random, scale: 0, opacity: 0 }` over 400ms
  - White radial gradient flash div scales from 0 to 1.5 and fades

**Parent grid integration:**
- For the `"quick"` mode, the button's `onClick` calls `quickRef.shatter()` instead of `onSelect` directly
- After 700ms timeout, calls `onSelect("quick")`
- All other 13 modes remain unchanged

### File changed
- `src/components/ModeIconGrid.tsx` — replace the static `case "quick"` with the new stateful `QuickMatchIcon` component, and add special handling in the grid's click handler

