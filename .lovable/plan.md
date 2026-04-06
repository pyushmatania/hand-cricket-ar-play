
# V10 ULTIMATE REBUILD — 10-Phase Plan

Based on CricketClash V10 Part 1 (Ultimate Rebuild Bible) + Part 2 (Secondary Screens + Cosmetics + Assets).

---

## Phase 1: Design DNA + Materials + Typography
**Scope:** Replace all V8 tokens with V10's definitive system.
- Update `index.css` with V10 color foundation (#4ADE50 Cricket Green, #FFD700 Trophy Gold, #00D4FF Stadium Cyan, #FF2D7B Neon Pink, #FF6B35 Neon Orange, #A855F7 Neon Purple)
- Update `tailwind.config.ts` with all V10 tokens
- Add 3 fonts: Bungee (display), Rajdhani 600/700 (UI), Outfit 400/500 (body)
- Implement 5 V10 material classes: Stadium Glass, Scoreboard Metal, Pitch Turf, Holo Chrome, Cricket Leather
- Add text effects: Neon Glow, 3D Extrusion, Gradient Fill
- Add V10 animation timing system + screen shake profiles
- Generate cricket leather texture asset via AI

**Files:** `index.css`, `tailwind.config.ts`, `index.html`

---

## Phase 2: Component Library (Buttons + Avatar + Shared)
**Scope:** Build V10's shared component system.
- V10 Button System: Primary (green gradient + 6px depth bar + press physics), BATTLE (68px, crossed bats, idle pulse, sparkle), Secondary, Danger, Icon, Currency
- PlayerAvatar rebuild: rounded-square 28% radius, team gradient border, XP ring SVG, level badge, online indicator
- CurrencyPill, CardFrame, Badge, GameProgressBar updates
- GameToggle component (3D Cricket Leather switch)

**Files:** `src/components/shared/GameButton.tsx`, `src/components/PlayerAvatar.tsx`, shared components

---

## Phase 3: BattleHub (New Home Screen) + Stadium Pitch Hero
**Scope:** Replace HomePage with the merged BattleHub.
- Create `BattleHub.tsx` (replaces HomePage + PlayPage)
- Create `StadiumPitchHero.tsx` — 3/4 perspective pitch scene (replaces floating islands)
- Generate 7 arena-specific stadium pitch images via AI (Gully, School, District, Ranji, IPL, International, World Cup)
- Top Identity Bar (76px, Stadium Glass, avatar + name + currency chips)
- Chest Banner Row (Free Chest + Wicket Chest)
- Stats bar + BATTLE button with V10 spec (cricket leather, sparkles, shine sweep)
- Update App.tsx routing

**Files:** `src/pages/BattleHub.tsx`, `src/components/StadiumPitchHero.tsx`, new assets

---

## Phase 4: Navigation (BottomNav + TopBar) + Mode Grids
**Scope:** Full rebuild of navigation + mode selection.
- BottomNav: Stadium Glass, SVG icons (replace emojis), 68px + safe-area, center Battle tab circle, neon-green active indicator, musical scale tab sounds
- TopBar: Stadium Glass, avatar + name + clan + currency pills
- PrimaryModeGrid: 2x2 grid (TAP, AR, PVP, TOURNAMENT) with mode gradients
- SecondaryModeList: 8 compact horizontal cards
- ChestSlotRow: 4 states (Empty, Locked, Unlocking, Ready)

**Files:** `src/components/BottomNav.tsx`, `src/components/layout/TopBar.tsx`, new mode components

---

## Phase 5: Gameplay Screen Rebuild (Hybrid Pitch + Tap UI + Scoreboard)
**Scope:** Full rebuild of the core gameplay experience.
- Hybrid view: 3D pitch background from batsman perspective
- Tap Mode: 7 circular buttons (0-6) in semi-circle pitch zones, Stadium Glass, 3D press
- Scoreboard: Scoreboard Metal bar, LED-style numbers, team logos, target info, momentum sparkline
- Ball Tracker: colored circles per ball result
- Bowler delivery animation sequence

**Files:** `src/components/GameScreen.tsx`, `src/components/TapGameScreen.tsx`, `src/components/TapPlayingUI.tsx`, `src/components/ScoreBoard.tsx`

---

## Phase 6: Scoring Popups (FOUR/SIX/OUT Choreography)
**Scope:** Frame-by-frame popup animations per V10 intensity hierarchy.
- FOUR!: 68px orange, slide-in from right, speed lines, shockwave, bat crack + crowd roar
- SIX!: 92px green gradient, slam down, screen shake (6 jolts), confetti (80+), fireworks (3), text disintegration
- OUT!: 76px pink cracked, explode from center, stump shatter, vignette intensify, context-dependent crowd
- Dot Ball / Single: minimal popups
- CelebrationEffects, StumpHitAnimation, CanvasFireworks rebuilds

**Files:** `src/components/ShotResultOverlay.tsx`, `src/components/CelebrationEffects.tsx`, `src/components/StumpHitAnimation.tsx`, `src/components/CanvasFireworks.tsx`

---

## Phase 7: VS Screen + Lobby + Post-Match
**Scope:** Full rebuild of match flow screens.
- VS Screen: Diagonal energy seam, massive characters, VS 108px Bungee + 3D extrusion, frame-by-frame entrance choreography
- Lobby/WaitingRoom: Team-colored side + dark opponent silhouette, heartbeat audio, MATCH FOUND flash sequence
- Post-Match: VICTORY (gold glow + confetti + fireworks + fanfare) vs DEFEAT (muted pink + dark vignette + somber)
- TrophyCeremony enhancements

**Files:** `src/components/VSIntroScreen.tsx`, `src/components/WaitingRoom.tsx`, `src/components/EnhancedPostMatch.tsx`, `src/components/TrophyCeremony.tsx`

---

## Phase 8: Cards + Collection + Chest Opening
**Scope:** Full rebuild of card system and chest ceremony.
- PlayerCard: Pointed arch shield shape, character fills top 55%, rarity glow bar, ribbon name banner, 6-stat diamond grid, rarity borders (Common→Mythic)
- CollectionPage: Horizontal rows like Clash Royale, 80px per row
- ChestReveal: Quilted diamond background, velvet pillow pedestal, tap-to-shake-crack-burst-cards sequence, legendary dramatic pause
- Generate card frame assets + chest assets via AI

**Files:** `src/components/PlayerCard.tsx`, `src/components/CollectionPlayerCard.tsx`, `src/pages/CollectionPage.tsx`, `src/components/shop/ChestReveal.tsx`

---

## Phase 9: Secondary Screens (Part 2)
**Scope:** Reskin/rebuild all secondary screens per V10 Part 2.
- ShopPage: Featured chest carousel, daily deals, item grid, purchase modal
- ProfilePage: Hero banner, stats chips, trophy cabinet, cosmetics carousel
- ClanPage: 5 tabs (Info, Chat, Donate, War, Browse)
- BattlePassPage: Horizontal 60-tier track, free vs premium, diamond marker
- LeaderboardPage: Top 3 podium, rivalry card, weekly challenges
- SettingsPage, FriendsPage, DailyRewardsPage, SpinWheelPage, MatchHistoryPage, NotificationsPage, TeamBuilderPage
- OnboardingTutorial: 6-step guided interactive experience

**Files:** All secondary page files + related components

---

## Phase 10: Sound + Haptics + 3D Assets + Polish
**Scope:** Complete sensory layer + asset generation + final polish.
- Rebuild `src/lib/sounds.ts` with 85+ Web Audio API SFX (frequencies, durations, volumes per V10 spec)
- Map 85+ haptic interactions (iOS UIImpactFeedback + Android equivalents)
- Generate remaining 3D assets via AI: characters (CSK batsman, MI bowler, RCB all-rounder), chest set (7 tiers), card frames (5 rarities), tab bar icons, trophies, bat skins, spin wheel pointer, daily reward icons
- Splash Screen enhancement: cricket ball arc, floodlight beams, flash exit
- Performance pass: reduce-motion support, particle budgets, lazy loading
- Cosmetics system update per V10 (bat skins, VS effects, avatar frames, button styles)

**Files:** `src/lib/sounds.ts`, `src/components/SplashScreen.tsx`, asset generation, cosmetics files

---

### Total Scope
- **35+ full rebuilds**, 15+ reskins, 5 new files, 2 deletions
- **40+ AI-generated 3D assets**
- **85+ sound effects**, 85+ haptic mappings
- Every surface uses 1 of 5 materials, every interaction = visual + sound + haptic
