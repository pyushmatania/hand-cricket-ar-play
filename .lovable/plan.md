

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
- Local `shattered` state boolean, resets after animation completes
- When idle: existing looping animation (ball bouncing toward stumps)
- When shattered:
  - Ball snaps to impact position
  - 3 stumps each get unique framer-motion `animate` props — left flies left with negative rotation, right flies right with positive rotation, center launches upward
  - 2 bails spin upward with 180°+ rotation and fade out
  - 4 golden spark particles burst outward from the impact center
  - White radial gradient flash div scales up and fades

**Parent grid integration:**
- The Quick Match button's `onClick` triggers `setShattered(true)` instead of navigating immediately
- A `useEffect` watching `shattered` fires `onSelect("quick")` after a 700ms `setTimeout`
- All other 13 mode icons remain completely unchanged

### File changed
- `src/components/ModeIconGrid.tsx` — replace the static `case "quick"` with the new stateful `QuickMatchIcon` component and add special click handling for the quick mode in the grid

