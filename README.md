# GWAN Card Game

A strategic multiplayer card game built with Next.js, React, and Socket.IO.

## Game Overview

GWAN is a strategic card game where players compete to score the highest total value across their side of the board. Players take turns playing cards or passing, with each card providing both value and potential special abilities.

## Game Structure

- 1 game = Best 2 of 3 rounds
- Each round ends when both players pass or run out of cards

## Setup

- Each player is dealt 10 cards from the standard deck
- Players roll to determine who goes first in round 1

## Gameplay Basics

**Objective:**  
Score the highest total value on your side of the field by strategically placing cards and using their special abilities.

**On Your Turn:**  
- Play one card to the appropriate row OR pass your turn
- Once you pass, you cannot play more cards that round

## Card Placement

Cards are placed in rows according to their suit:

- **Infantry** (Close Combat row): +2 row bonus when no weather effects
- **Archer** (Mid Range row): +3 row bonus when no weather effects
- **Ballista** (Long Range row): +5 row bonus when no weather effects
- **Mercenary** (Flexible): Can be played in either Close or Mid Range rows

## Scoring

- Each card contributes its base value to your score
- Each row with at least one card gets its row bonus (if no weather effect)
- Your total score is the sum of all cards plus row bonuses

## Special Card Types

### Commander Cards (Face Cards)
- Jacks (11), Queens (12), Kings (13)
- Maintain their full value even under weather effects

### Weather Cards (Aces)
- Affect both players and last until cleared
- **Ace of Infantry** (Tundra): Nullifies Close Combat row bonus; reduces non-Commander cards to value 1
- **Ace of Archer** (Rain): Nullifies Mid Range row bonus; reduces non-Commander cards to value 1
- **Ace of Ballista** (Fog): Nullifies Long Range row bonus; reduces non-Commander cards to value 1
- **Ace of Mercenary** (Clear Skies): Clears weather effect from one row of your choice

### Spy Cards (5s)
- Played to your opponent's matching row
- Let you draw 2 new cards from the deck
- Add their value (5) to your opponent's score (strategic sacrifice)

### Joker Cards
- Act similarly to spy cards, but with special benefits
- Can be played to any row (target row must be selected)
- Only add 1 point to your opponent's score (instead of 5)
- Let you draw 2 new cards from the deck

### Medic Cards (3s)
- Allow you to revive a card from your discard pile
- Play to your side of the board like normal cards
- After playing, choose any card from your discard pile to add to your hand

### Decoy Cards (4s)
- Worth 0 points when played
- Allow you to retrieve any card from your field back to your hand
- Play to your side of the board like normal cards
- After playing, choose any card from your field to return to your hand

### Rogue Cards (2s of mercenary, infantry, ballista)
- When played, roll 1D6 to determine the card's value (1-6)
- Play to your side of the board like normal cards
- Strategic risk-taking: can be extremely low or high value

### Sniper Cards (2 of archer)
- When played, roll 2D6
- If doubles are rolled, you can target and destroy one enemy non-Commander card
- Played to your side of the board like normal cards
- Base value of 2 if no doubles are rolled

### Blight Cards
Each player secretly selects one powerful Blight card at the beginning of a match:

- Blight cards have unique, powerful effects that can change the course of the game
- Each player can only use their Blight card once per entire match
- Blight cards can only be played at the beginning of your turn
- To use your Blight card, click on "Cast Blight Magic" at the start of your turn
- Some Blight cards require dice rolls or targeting specific cards or rows
- Examples include doubling a card's value, stealing cards, or destroying opponent's cards

## Rounds and Victory
- The player with the highest total score when both players pass wins the round
- First player to win 2 rounds wins the game
- For subsequent rounds, the loser of the previous round goes first
- In subsequent rounds, each player draws 1 new card

## Strategy Tips
- **Weather timing**: Play weather cards to weaken rows where your opponent is strong
- **Commanders**: Save commander cards for rows affected by weather since they keep their value
- **Row distribution**: Try to spread your cards to benefit from multiple row bonuses
- **Spy cards**: Use these strategically - they help your opponent's score but let you draw more cards
- **Joker cards**: Great for late-game plays - minimal point boost to opponent but gives you card advantage
- **Decoy cards**: Use to retrieve powerful cards back to your hand, especially when you need to reuse commanders or special cards
- **Passing**: Knowing when to pass is key - sometimes letting your opponent play more cards while you conserve yours for later rounds is beneficial

## Technical Implementation

### Multiplayer Implementation

This game uses Socket.IO to enable real-time multiplayer gameplay:

- **Server**: Custom Node.js server using Socket.IO for WebSocket communication
- **Client**: Next.js React application with TypeScript
- **State Management**: Server-authoritative model to prevent cheating
- **Game Logic**: Turn-based mechanics with validation on the server

### Running the Game

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

4. To play multiplayer, have another player connect to your server address

### Development

The project follows a client-server architecture:

- `server.ts`: Socket.IO server setup
- `server/models/game.model.ts`: Game state and logic
- `server/handlers/gameHandler.ts`: Socket event handlers
- `lib/socket.ts`: Client-side Socket.IO integration
- `shared/schema.ts`: Shared type definitions
- Components in `/components` directory

## License

MIT
