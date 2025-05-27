import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LobbyScreen from './components/LobbyScreen';
import WaitingRoom from './components/WaitingRoom';
import CardSelectionScreen from './components/CardSelectionScreen';
import GameBoard from './components/game/GameBoard';
import { useGameStore } from './store/gameStore';

function App() {
  const { 
    inRoom, 
    gameStarted, 
    cardsArranged, 
    opponentCardsArranged 
  } = useGameStore();

  // Determine which screen to show
  const renderScreen = () => {
    if (gameStarted) {
      if (cardsArranged && opponentCardsArranged) {
        return <GameBoard />;
      }
      return <CardSelectionScreen />;
    }
    if (inRoom) {
      return <WaitingRoom />;
    }
    return <LobbyScreen />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">
            Question or Truth
          </h1>
          <p className="text-gray-400">Connect and play with friends in real-time</p>
        </header>
        
        <main className={`mx-auto ${!(cardsArranged && opponentCardsArranged) ? 'max-w-md' : ''}`}>
          {renderScreen()}
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Question or Truth. All rights reserved.</p>
        </footer>
      </div>
      
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;