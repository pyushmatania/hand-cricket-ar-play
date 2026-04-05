

## Plan: Interactive Quick Match Icon — Stump Shatter on Tap

### What it does
When the player taps the Quick Match icon, instead of immediately navigating, a dramatic shatter animation plays: the ball smashes into the stumps, stumps fly apart, bails spin into the air, sparks burst out — then after ~700ms the game loads.

### Shatter animation sequence
1. **Ball impact** (~200ms) — ball accelerates downward into the stumps
2. **Stumps scatter** — left stump rotates and flies left, right goes right, center launches upward — all fade out
3. **Bails fly** — both bails spin upward with rotation and fade
4. **Spark burst** — 3-4 golden particles explode from the impact point
5. **Flash glow** — brief white radial flash at the collision center
6. **Navigate** — after 700ms, the Quick Match game mode loads

### Technical details
- Create a small `QuickMatchIcon` sub-component inside `ModeIconGrid.tsx` with local `shattered` state
- Use framer-motion `animate` props driven by the `shattered` boolean for stumps, bails, and sparks
- The parent grid intercepts the Quick Match button's `onClick` to trigger shatter, then calls `onSelect("quick")` after a timeout
- All other 13 mode icons remain completely unchanged

### File changed
- `src/components/ModeIconGrid.tsx`

