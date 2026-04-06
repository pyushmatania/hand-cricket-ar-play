## Auction Draft System — Enhancement Plan

The auction draft system already exists with full bidding, AI opponents, knockout matches, and results. Here's what we'll enhance:

### 1. Fix "Play Again" button (currently just goes home)
- Wire the Play Again button to actually reset all state and restart

### 2. Add bid war mechanic (multi-round bidding)
- Instead of single-bid → sold, add counter-bidding rounds
- Player bids → AI counters → Player can raise or fold
- Up to 3 rounds of bidding per player
- Adds drama and strategy to each auction lot

### 3. Add live bid history ticker
- Show a scrolling ticker of recent auction results ("Kohli SOLD to AI for 🪙350")
- Visible during the auction phase

### 4. Save auction results to database
- Save final team, placement, and budget to `auction_sessions` and `auction_budgets` tables
- Show past auction results on return

### 5. Wire team characters into auction
- Show IPL team character illustrations on player cards during auction
- Use the team-to-character mapping for visual flair
