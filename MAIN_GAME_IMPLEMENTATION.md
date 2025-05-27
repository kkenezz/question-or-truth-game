# Main Game Implementation Plan

## Components Structure

### 1. Game Board Layout
```jsx
<GameBoard>
  <PlayerSection>  {/* Top */}
    <OpponentCards />
    <OpponentTokens />
    <OpponentStatus />
  </PlayerSection>
  
  <GameSection>    {/* Middle */}
    <BiddingArea />
    <Timer />
    <ActionArea />
  </GameSection>
  
  <PlayerSection>  {/* Bottom */}
    <PlayerCards />
    <PlayerTokens />
    <PlayerStatus />
  </PlayerSection>
</GameBoard>
```

## Component Details

### 1. Token System Components
- **TokenDisplay**
  - Shows current token count (0-10+)
  - Visual warning when ≤5 tokens (red glow effect)
  - Animation for token changes

- **BiddingInterface**
  - Token slider/input (0 to max available)
  - Submit bid button
  - 30-second countdown timer
  - Visual feedback for bid submission
  - Tie resolution interface

### 2. Action Phase Components
- **ActionSelector**
  - Two main buttons:
    - "Ask Question"
    - "State Truth"
  - Only visible to bid winner

- **QuestionInterface**
  - Predefined question list dropdown
  - Question preview
  - Submit question button
  - Answer display area

- **TruthInterface**
  - Card arrangement guess interface
  - Card value selector (A-K)
  - Position indicators (1-8)
  - Submit guess button
  - Feedback display

### 3. Game State Management
```typescript
interface GameState {
  // Token Management
  playerTokens: number;
  opponentTokens: number;
  currentBid: {
    player: number | null;
    opponent: number | null;
  };
  
  // Round Management
  roundNumber: number;
  timeRemaining: number;
  biddingPhase: boolean;
  
  // Action Management
  currentTurn: 'player' | 'opponent' | null;
  selectedAction: 'question' | 'truth' | null;
  actionInProgress: boolean;
  
  // Game Progress
  revealedCards: {
    position: number;
    value: number;
  }[];
  gameResult: 'ongoing' | 'won' | 'lost';
}
```

## WebSocket Events

### 1. Bidding Events
```typescript
// Outgoing
'submit_bid': { amount: number }
'bid_timeout': {}

// Incoming
'bid_result': {
  winner: 'player' | 'opponent';
  playerBid: number;
  opponentBid: number;
  isTie: boolean;
}
'token_update': {
  playerTokens: number;
  opponentTokens: number;
}
```

### 2. Action Events
```typescript
// Outgoing
'select_action': { type: 'question' | 'truth' }
'submit_question': { questionId: string }
'submit_truth': { cardGuesses: number[] }

// Incoming
'action_result': {
  type: 'question' | 'truth';
  success: boolean;
  answer?: string;
  correctPositions?: number[];
}
```

## Implementation Phases

### Phase 1: Basic Structure
1. Create main game board layout
2. Implement token display components
3. Set up basic game state management

### Phase 2: Bidding System
1. Implement bidding interface
2. Add 30-second timer
3. Create token animation system
4. Implement tie resolution

### Phase 3: Action System
1. Build action selector interface
2. Implement question interface
3. Create truth guessing interface
4. Add result feedback system

### Phase 4: Game Flow
1. Implement round management
2. Add victory condition checking
3. Create end-game scenarios
4. Implement rematch system

## UI/UX Considerations

### 1. Visual Feedback
- Animate token changes
- Highlight active player/phase
- Clear status indicators
- Smooth transitions between phases

### 2. Player Information
- Clear token counts
- Timer visibility
- Action phase indicators
- Game progress tracking

### 3. Error Prevention
- Confirm important actions
- Prevent invalid bids
- Validate all inputs
- Clear error messages

## Testing Strategy

### 1. Component Testing
- Token management logic
- Bidding system validation
- Timer functionality
- Action submission

### 2. Integration Testing
- WebSocket communication
- Game state synchronization
- Round progression
- Victory condition

### 3. Edge Cases
- Disconnection handling
- Tie resolution
- Token limit scenarios
- Invalid action attempts

## Next Steps
1. Set up basic game board structure
2. Implement token system and display
3. Create bidding interface with timer
4. Build action selection system
5. Add WebSocket event handlers
6. Implement game state management
7. Create victory condition checking 