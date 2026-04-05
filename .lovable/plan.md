

## Plan: Interactive Quick Match Icon with Stump Shatter Animation

### What changes
When the Quick Match icon is tapped, the stumps shatter apart with a dramatic animation before navigating — bails fly off with spin, stumps scatter outward, sparks burst from the impact point — then after ~700ms the game mode loads.

### How it works

**Shatter sequence (triggered on tap):**
1. Ball accelerates into the stumps (~200ms)
2. 3 stumps fly outward with rotation — left goes left, right goes right, center flies up — all fade out
3. 2 bails launch upward with random spin and fade
4. 3-4 golden spark particles burst from impact center
5. Brief white flash glow at collision point
6. After ~700ms total, navigation fires to the game

**Implementation:**
- Extract the Quick Match icon into a stateful `QuickMatchIcon` sub-component with a `shattered` boolean
- Use framer-motion `animate` props driven by the shattered state for each stump/bail/spark element
- Only the Quick Match button gets special tap handling; all other mode icons remain unchanged

### Files modified
- `src/components/ModeIconGrid.tsx` — add `QuickMatchIcon` component with shatter animation logic

