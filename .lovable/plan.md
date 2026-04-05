

## Plan: Interactive Quick Match Icon with Stump Shatter Animation

### What changes
Modify the `ModeIcon` component's `"quick"` case in `ModeIconGrid.tsx` to support a "shatter" state. When tapped, instead of immediately navigating, the stumps scatter outward, bails fly off with rotation, sparks appear, and after ~600ms the navigation fires.

### Technical approach

**1. Add state to Quick Match icon** — Extract the `"quick"` case into a small sub-component (`QuickMatchIcon`) that accepts an `onShatter` callback and manages its own `shattered` boolean state.

**2. Shatter animation sequence** (triggered on tap):
- Ball accelerates into stumps (fast `y` tween, ~200ms)
- 3 stumps fly outward: left stump rotates left + flies left/down, right stump rotates right + flies right/down, center stump flies straight back/up — all fade out
- 2 bails launch upward with spin (random rotation), fade out
- 3-4 golden spark particles burst from impact point
- Flash glow at impact center

**3. Timing** — Total shatter animation ~700ms, then call `onSelect("quick")` to navigate.

**4. Integration** — In the `ModeIconGrid` grid rendering, intercept the `"quick"` mode's `onClick` to trigger the shatter state on `QuickMatchIcon` instead of immediately calling `onSelect`. All other modes remain unchanged.

### Files modified
- `src/components/ModeIconGrid.tsx` — Replace static quick match icon with stateful `QuickMatchIcon` component, add shatter animation variants

