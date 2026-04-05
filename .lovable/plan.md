
# V8 SUPERCELL DESIGN BIBLE — 10-Phase Implementation

This is a complete visual, material, and interaction overhaul based on the V8 spec. Supersedes V7. Uses AI image generation for all key assets.

---

## Phase 1: V8 Global Design System Foundation
**What:** Replace V7 tokens with V8's complete system in `index.css` and `tailwind.config.ts`. Add the 7-layer background stack (`game-screen` class), update fonts to use Bungee (display), Rajdhani (UI), Outfit (body). Define spacing tokens, all CSS variables from the V8 color palette (--bg-void through --border-team). Add cricket-specific tokens (--cricket-red, --cricket-willow, --cricket-grass, --cricket-white, --stump-gold).

**Files:** `index.css`, `tailwind.config.ts`, `index.html`

---

## Phase 2: V8 5 Material Classes
**What:** Replace V7's 4 materials with V8's 5: Stadium Glass (`.stadium-glass`), Pitch Turf (`.pitch-turf`), Scoreboard Metal (`.scoreboard-metal`), Holo Chrome (`.holo-chrome`), Cricket Leather (`.cricket-leather` — NEW). Each material has hover/active/disabled states, team accent stripe, edge light bleed. Generate AI texture images for cricket-grid pattern, noise grain, and leather seam texture.

**Files:** `index.css`, generate 3 texture assets

---

## Phase 3: V8 Component Library — Buttons & Avatar
**What:** Create reusable V8 button components: `.btn-primary` (green gradient, 6px bottom bar, press sink animation, shine sweep), `.btn-secondary` (stadium glass), `.btn-danger` (pink gradient), `.btn-icon` (circle), `.btn-currency-add` (+). Rebuild `PlayerAvatar` with V8 spec: rounded-square 28% radius, gradient team border, XP ring SVG, level badge, online indicator. 

**Files:** New `src/components/v8/V8Button.tsx`, `src/components/v8/V8Avatar.tsx`, `index.css` (button animations)

---

## Phase 4: V8 Home Screen — Top Identity Bar + Chest Banners
**What:** Delete current HomePage top bar. Rebuild with V8 spec: Stadium Glass bar, V8Avatar (72px), player name (Rajdhani Bold 16px), clan name, trophy chip (scoreboard-metal pill with gold trophy), currency chips (scoreboard-metal pills with spinning coin/gem + add buttons), settings/bell icon buttons. Fade bottom edge with mask-image. Two chest banners below: Free Chest (warm gradient, bouncing chest icon, golden pulse) and Wicket Chest (cool gradient, progress bar).

**Files:** `src/pages/HomePage.tsx` (top section)

---

## Phase 5: V8 Home Screen — Arena Title + 3D Floating Island
**What:** Arena title in Bungee with team-primary glow + 7 progression dots. Generate 7 unique AI island images (Gully Grounds, School Playground, District Stadium, Ranji Stadium, IPL Arena, International Ground, World Cup). Each island has its own style per V8 spec. Island bobs 7px over 4.5s. Swipeable arena carousel. Stats overlay strip below island.

**Files:** `src/pages/HomePage.tsx`, generate 7 island images

---

## Phase 6: V8 Home Screen — BATTLE Button + Stats Bar + Mode Cards
**What:** Rebuild BATTLE button per V8 spec: 68px tall, 26px Bungee text, crossed-bats icon, idle pulse (15→45→15px glow), shine sweep every 4s, sparkle dots, arena badge pill. Stats bar ABOVE button (scoreboard-metal strip: MATCHES | WINS | WIN%). Three mode cards (TAP/PVP/AR) as Stadium Glass cards with team accent stripes, animated icons, and chrome brackets.

**Files:** `src/pages/HomePage.tsx`

---

## Phase 7: V8 Home Screen — Chest Slots + Secondary Modes
**What:** 4 chest slots per V8 spec: Empty (dashed border, ghost outline), Locked (padlock, desaturated), Unlocking (circular SVG timer ring, cyan accent), Ready (gold border, bouncing chest, conic-gradient light rays, "OPEN!" text). Secondary modes list with Stadium Glass cards and team accent left borders. Arena progress bar with pitch-turf material.

**Files:** `src/pages/HomePage.tsx`

---

## Phase 8: V8 Living Particles + 7-Layer Background
**What:** Replace V7 CSS particles with V8's full particle system: 25-35 dust motes, team-colored at 12-22% opacity, sine-wave horizontal drift, 10-18s lifespan. Implement all 7 background layers: void base, stadium gradient wash (team-colored floodlight spill), cricket pitch grid pattern, film grain noise, atmospheric haze, radial vignette, living particles. Generate cricket-grid.png and noise256.png textures via AI.

**Files:** `src/pages/HomePage.tsx`, `index.css`, generate texture assets

---

## Phase 9: V8 Animation Bible + Interaction Polish
**What:** Implement V8 animation timing/easing system. Screen shake profiles (Feather/Light/Medium/Heavy/Earthquake). Button press physics (translateY + shadow shrink on press, 80ms). Staggered section entrances with spring physics. Neon text glow library (green/cyan/pink/gold/purple). Shimmer sweep animation on idle buttons. Trophy spin animation (rotateY 6s). Gem prismatic hue-rotate. All hover/active/disabled states per V8 material specs.

**Files:** `index.css`, `src/pages/HomePage.tsx`

---

## Phase 10: V8 Bottom Tab Bar + Final Polish
**What:** Rebuild BottomNav per V8 spec: Stadium Glass material, 68px + safe-area, rounded top (22px), 5 tabs (Shop/Collection/Battle/Clan/Rankings), active tab has neon-green pill indicator + filled icon + upward glow. Each tab has pitch-varied tap sound. Final responsive sizing pass, performance optimization (reduce-motion support), and comprehensive visual QA.

**Files:** `src/components/BottomNav.tsx`, `index.css`

---

### NOT in this plan (future):
- VS/Pre-match screen animation sequence (Ch 6)
- Lobby/Matchmaking UX (Ch 7)
- Match/Gameplay screen rebuild (Ch 8)
- Player Cards & Collection screen (Ch 9)
- Chest opening ceremony (Ch 10)
- Shop, Clan, Tournament, Profile screen rebuilds (Ch 11-15)
- Scoring popups (Ch 16)
- Sound design integration (Ch 17)
- Haptic feedback system (Ch 18)

**Shall I start with Phase 1?**
