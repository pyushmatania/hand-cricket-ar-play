
# Phase 10: Sound + Haptics + Splash Polish

## Step 1: Expand Web Audio SFX Library (85+ effects)
Rebuild `src/lib/sounds.ts` with V10-spec sounds covering all categories:

**New SFX to add (~50+ new):**
- **Bat hits**: `batSoft`, `batMedium`, `batHard`, `batMassive` (intensity-mapped)
- **Ball sounds**: `ballBounce`, `ballIntoGloves`, `ballEdge`, `ballPadHit`, `ballFlight`
- **Stumps**: `stumpsHit`, `bailsFlying`
- **Crowd layers**: `crowdCheerMild`, `crowdCheerExcited`, `crowdEruption`, `crowdGasp`, `crowdGroan`, `crowdAppeal`
- **UI sounds**: `cardSlideIn`, `cardSlideOut`, `scoreTick`, `drawerOpen`, `drawerClose`, `tabSwitch`, `modalOpen`, `modalClose`
- **Rewards**: `coinCollect`, `gemCollect`, `cardFlip`, `legendaryReveal`, `chestShake`, `chestCrack`, `chestBurst`
- **Special**: `coinFlip`, `coinLand`, `heartbeat`, `timerExpire`, `drsWhoosh`, `drsVerdict`
- **Match flow**: `matchFound`, `vsSlam`, `walkoutDrums`, `overBreak`, `inningsSwitch`
- **Social**: `chatMessage`, `friendRequest`, `clanWarHorn`

All synthesized via Web Audio API (no MP3 dependencies).

## Step 2: Comprehensive Haptic Mappings (85+)
Expand `Haptics` object to match every SFX with appropriate vibration patterns:
- Intensity tiers: `micro(3ms)`, `light(8ms)`, `medium(20ms)`, `heavy(40ms)`, `impact(60ms)`
- Complex patterns for: stumps, crowd reactions, chest opening, card reveals, DRS, celebrations

## Step 3: Splash Screen Enhancement
- Add floodlight beam sweeps during loading
- Cricket ball arc animation (ball travels across screen)
- Flash exit transition (white flash → fade)
- Add splash SFX (stadium ambience + horn on complete)

## Step 4: reduce-motion Support
- Wrap all SFX/haptics in a `prefers-reduced-motion` check
- Add `soundEnabled` and `hapticsEnabled` settings integration

**Files modified:** `src/lib/sounds.ts`, `src/components/SplashScreen.tsx`
**No new dependencies needed** — all Web Audio API
