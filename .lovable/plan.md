

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

**New sub-component: `QuickMatchIcon`** inside `ModeIconGrid.tsx`
- Accepts a `shattered` boolean prop
- When idle: shows the existing looping animation (ball bouncing toward stumps)
- When shattered:
  - Ball snaps to impact position
  - 3 stumps get unique framer-motion animate props — left flies left with -35deg rotation, right flies right with +35deg, center launches upward — all fade out
  - 2 bails spin upward (~200deg rotation) and fade
  - 4 golden spark particles burst outward from impact center
  - White radial gradient flash scales up and fades

**Parent grid integration:**
- Quick Match button gets special onClick: sets local `shattered` state to true, plays SFX
- useEffect watching `shattered` fires `onSelect("quick")` after 700ms timeout, then resets
- All other 13 mode icons remain completely unchanged

### File changed
- `src/components/ModeIconGrid.tsx` — replace the static `case "quick"` with the new stateful `QuickMatchIcon` component, add shatter state + special click handling in the grid

