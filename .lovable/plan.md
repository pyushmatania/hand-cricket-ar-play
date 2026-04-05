

## Plan: Interactive Quick Match Icon with Stump Shatter Animation

### What changes
When the Quick Match icon is tapped, instead of immediately navigating, the stumps shatter apart — bails fly off with spin, stumps scatter outward, sparks burst from the impact point — then after ~700ms the navigation fires.

### Technical approach

**1. Stateful QuickMatchIcon sub-component** inside `ModeIconGrid.tsx`:
- Manages a `shattered` boolean
- On tap: ball fast-animates into stumps, then triggers shatter state

**2. Shatter animation (framer-motion variants):**
- 3 stumps fly outward with rotation (left stump goes left, right goes right, center flies up) + fade out
- 2 bails launch upward with random spin, fade out
- 3-4 golden spark particles burst from impact center
- Brief white flash glow at collision point

**3. Timing:** ~700ms total, then calls `onSelect("quick")` to navigate

**4. Integration:** Only the `"quick"` mode button gets special tap handling; all other modes unchanged.

### Files modified
- `src/components/ModeIconGrid.tsx`

