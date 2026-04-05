
# V7 Neon Cricket Carnival — Phased Home Page Rebuild

The V7 doc is massive (covers every screen). We'll focus on the **Home/Battle page** first, broken into 6 phases. Each phase is a standalone deliverable you can test before moving on.

---

## Phase 1: Global Design System Foundation
**What:** Set up V7's color tokens, typography (Bungee, Rajdhani, Outfit), and material classes (neon-glass, holo-chrome, scoreboard-metal, pitch-turf) in `index.css` and `tailwind.config.ts`. Add the layered background system (abyss bg + gradient mesh + grid pattern + vignette + ambient particles).

**Files:** `index.css`, `tailwind.config.ts`, `index.html` (Google Fonts)

---

## Phase 2: Player Bar + Currency Pills (Section A)
**What:** Rebuild the top bar as a neon-glass panel with hexagonal avatar frame, gradient text player name, trophy count with gold glow, scoreboard-metal currency chips with animated coin/gem icons, and the settings/notification icons. Fade-to-transparent bottom edge.

**Files:** `HomePage.tsx` (top bar section)

---

## Phase 3: Chest Banners + Floating Island (Sections B + C)
**What:** Two neon-glass banner cards (Free Chest with golden pulse, Wicket Chest with progress bar). The 3D floating island centerpiece with bob animation, shadow, character, stats overlay strip, arena title shimmer, and swipeable locked arenas. Generate a new V7 neon-lit island image.

**Files:** `HomePage.tsx`, new island asset

---

## Phase 4: BATTLE Button + Mode Cards (Sections D + E)
**What:** The big green BATTLE button with V7 styling (neon-green gradient, 5px border-bottom, pulsing glow, shimmer sweep, press animation). Three mode cards (TAP/PVP/AR) as neon-glass cards with team-colored borders, animated icons, and chrome brackets.

**Files:** `HomePage.tsx`

---

## Phase 5: Arena Progress + Chest Slots + Secondary Modes (Sections F + G + H)
**What:** Pitch-turf progress bar with crease markings. Four neon-glass chest display slots with proper states (empty/locked/unlocking/ready with golden glow + bouncing item + light rays). Secondary mode list with neon-glass cards and team-accent left borders.

**Files:** `HomePage.tsx`

---

## Phase 6: Ambient Particles + Polish
**What:** Add the floating dust-mote particle system (20-30 particles, team-colored, drifting upward). Fine-tune all animations, transitions, and responsive sizing. Ensure consistent neon glow language across all elements.

**Files:** `HomePage.tsx`

---

### What's NOT in this plan (future phases for other screens):
- VS/Pre-match screen redesign
- Player Card visual system
- Chest opening animations
- Tab bar redesign
- Settings, Profile, Shop, Collection screen redesigns
- Match HUD redesign

**Shall I start with Phase 1?**
