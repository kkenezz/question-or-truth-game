# Question or Truth - Online Multiplayer Card Game

## Game Overview
Question or Truth is a 2-player online deduction game that combines strategic card arrangement with a unique bidding and questioning system. Players must use their tokens wisely to either gather information through questions or make direct guesses about their opponent's card arrangement.

## Core Game Mechanics

### 1. Set Up Phase
- **Card Selection** ⚡️
  - ✅ Each player selects 8 cards from a standard deck (52-card matrix interface)
  - ✅ Cards must be arranged in a specific order (rostrum implementation)
  - ✅ Cards of the same suit must be arranged in ascending order (validation complete)
  - ✅ Card values implemented (A=1, J=11, Q=12, K=13)

- **Initial Resources** 🚧
  - ❌ Each player starts with 10 tokens (Not implemented)
  - ❌ Token system integration (Not implemented)

Status: Setup Phase is 60% complete. Missing token system implementation.

### 2. Bidding System
- **Bid Structure**
  - Each player starts with 10 tokens
  - Each round, players secretly submit tokens (0-10+ tokens)
  - 30-second timer for token submission
  - Higher bidder wins the right to act
  - Tie handling: If equal bids, dealer takes tokens, both players get +2 tokens, then rebid
  - Token management: Players get +2 tokens each round
  - Warning system: Red warning light when player has ≤5 tokens (visible to both players)

- **Token Management**
  - Tokens spent in bidding are lost regardless of outcome
  - Players must manage their token pool strategically
  - Running out of tokens limits available actions

### 3. Action Phase
- **Question Action**
  - Winner can ask one question about opponent's card arrangement
  - Question list I will provide later

- **Truth Action**
  - Guess opponent's 8-card arrangement (suits irrelevant, only values matter)
  - Incorrect guesses waste the action

### 4. Victory Conditions
- **Primary Win Condition**
  - First player to correctly identify all opponent's cards wins
  - Can be achieved through multiple successful Truth actions
  - If the player's guess is correct, it will end in victory for that player. if their guess is wrong, players shall submit tokens to begin a new round. 

1. Game Board Component
typescript// Main game interface during bidding/question phases
- Your rostrum (cards face up)
- Opponent rostrum (cards face down with position numbers)
- Current tokens display
- Warning light indicator (red when ≤5 tokens)
- Round counter
2. Bidding Interface
typescript// Active during bidding phase
- Token slider/input (0 to current token count)
- 30-second countdown timer
- "Submit Bid" button
- Bidding status: "Waiting for bids..." / "Bids submitted, revealing..."
3. Action Selection Component
typescript// Show for winning bidder
- Two buttons: "Ask Question" / "State Truth"
- Question list modal (when Ask Question selected)
- Truth input interface (when State Truth selected)


## Game Flow
1. Players join game room
2. Select and arrange 8 cards
3. Confirm arrangements
4. Alternate between:
   - Bidding Phase
   - Action Phase (Question or Truth)
5. Game continues until victory condition is met

## Strategic Elements
- **Token Management**
  - Balance between aggressive and conservative bidding
  - Saving tokens for critical moments
  - Forcing opponent to spend tokens

- **Information Gathering**
  - Building knowledge through strategic questions
  - Tracking opponent's answers
  - Deducing card positions

- **Bluffing**
  - Using high bids to suggest confidence
  - Asking misleading questions
  - Making strategic guesses

## Technical Considerations
- **Real-time Communication**
  - Websocket connection for live updates
  - Handling disconnections
  - Syncing game state

- **Game State Management**
  - Card arrangements
  - Token counts
  - Revealed information
  - Turn tracking

- **User Interface**
  - Card visualization
  - Bidding interface
  - Question/Truth action interface
  - Game progress tracking

## Future Enhancements
- **Additional Features**
  - Game history
  - Replay system
  - Spectator mode
  - Tournament support

- **Social Features**
  - Friend system
  - Leaderboards
  - Achievement system

## Notes
This game combines elements of:
- Strategic resource management (tokens)
- Deduction and logic
- Bluffing and psychology
- Real-time player interaction

The balance between gathering information through questions and making direct guesses creates an engaging dynamic where players must carefully manage their resources while building their understanding of their opponent's cards. 