import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../contexts/socket-context';
import MultiplayerGameBoard from '../components/multiplayer/game-board';
import MultiplayerPlayerHand from '../components/multiplayer/player-hand';
import { GameState } from '../lib/types';
import { useRouter } from 'next/router';

export default function MultiplayerGamePage() {
  const socketClient = useContext(SocketContext);
  const router = useRouter();
  const { gameId } = router.query;
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number>(-1);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(false);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize the game when component mounts
  useEffect(() => {
    if (!socketClient || !gameId) return;

    // Join the game
    if (typeof gameId === 'string') {
      socketClient.joinGame(gameId).then(response => {
        if (!response.success) {
          setErrorMessage(response.error || 'Failed to join game');
        }
      });
    }

    // Listen for game state updates
    const handleGameState = (state: GameState) => {
      console.log('Game state updated:', state);
      setGameState(state);
      setIsLoading(false);
      
      // Check if it's the player's turn
      if (playerIndex !== -1) {
        setIsPlayerTurn(state.currentPlayer === playerIndex);
      }
    };

    // Listen for game joined event
    const handleGameJoined = (data: { gameId: string; playerIndex: number }) => {
      console.log(`Joined game ${data.gameId} as player ${data.playerIndex}`);
      setPlayerIndex(data.playerIndex);
    };

    // Listen for opponent joined event
    const handleOpponentJoined = (data: { username: string }) => {
      console.log(`Opponent ${data.username} joined the game`);
    };

    // Listen for opponent left event
    const handleOpponentLeft = () => {
      console.log('Opponent left the game');
      setErrorMessage('Opponent left the game');
    };

    // Listen for game error event
    const handleGameError = (data: { message: string }) => {
      console.error('Game error:', data.message);
      setErrorMessage(data.message);
    };

    // Listen for turn started event
    const handleTurnStarted = (data: { playerIndex: number; playerName: string }) => {
      console.log(`Player ${data.playerName}'s turn started`);
      setIsPlayerTurn(data.playerIndex === playerIndex);
    };

    // Add event listeners
    socketClient.on('game:state', handleGameState);
    socketClient.on('game:joined', handleGameJoined);
    socketClient.on('game:opponentJoined', handleOpponentJoined);
    socketClient.on('game:opponentLeft', handleOpponentLeft);
    socketClient.on('game:error', handleGameError);
    socketClient.on('game:turnStarted', handleTurnStarted);

    // Clean up event listeners on unmount
    return () => {
      socketClient.off('game:state', handleGameState);
      socketClient.off('game:joined', handleGameJoined);
      socketClient.off('game:opponentJoined', handleOpponentJoined);
      socketClient.off('game:opponentLeft', handleOpponentLeft);
      socketClient.off('game:error', handleGameError);
      socketClient.off('game:turnStarted', handleTurnStarted);
    };
  }, [socketClient, gameId, playerIndex]);

  // Handle playing a card
  const handlePlayCard = (cardIndex: number, targetRow?: string) => {
    if (!socketClient || !isPlayerTurn) return;

    socketClient.playCard(cardIndex, targetRow).then(response => {
      if (!response.success) {
        setErrorMessage(response.error || 'Failed to play card');
      }
    });
  };

  // Handle passing turn
  const handlePass = () => {
    if (!socketClient || !isPlayerTurn) return;

    socketClient.endTurn().then(response => {
      if (!response.success) {
        setErrorMessage(response.error || 'Failed to pass turn');
      }
    });
  };

  // Handle undoing last action
  const handleUndo = () => {
    if (!socketClient || !isPlayerTurn || !canUndo) return;

    socketClient.undoLastAction().then(response => {
      if (!response.success) {
        setErrorMessage(response.error || 'Failed to undo action');
      }
    });
  };

  // Handle leaving the game
  const handleLeaveGame = () => {
    if (!socketClient) return;

    socketClient.leaveGame().then(response => {
      if (response.success) {
        router.push('/');
      } else {
        setErrorMessage(response.error || 'Failed to leave game');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-amber-900/20 to-black">
        <h1 className="text-2xl font-bold text-amber-200 mb-4">Loading Game...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-amber-900/20 to-black">
        <div className="bg-red-900/50 p-6 rounded-lg border border-red-500 max-w-md">
          <h1 className="text-2xl font-bold text-red-200 mb-4">Error</h1>
          <p className="text-red-100 mb-6">{errorMessage}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-md"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameState || playerIndex === -1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-amber-900/20 to-black">
        <h1 className="text-2xl font-bold text-amber-200 mb-4">Waiting for Game to Start...</h1>
        <p className="text-amber-100 mb-6">Game ID: {gameId}</p>
        <button
          onClick={handleLeaveGame}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 text-red-100 rounded-md"
        >
          Leave Game
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900/20 to-black p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-amber-200">Gwan Card Battle</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleLeaveGame}
              className="px-3 py-1 bg-red-700 hover:bg-red-600 text-red-100 rounded-md text-sm"
            >
              Leave Game
            </button>
          </div>
        </header>

        {/* Game Board */}
        <MultiplayerGameBoard 
          gameState={gameState} 
          playerView={playerIndex} 
        />

        {/* Player Hand */}
        <MultiplayerPlayerHand 
          hand={gameState.players[playerIndex].hand} 
          onPlayCard={handlePlayCard}
          onPass={handlePass}
          onUndo={handleUndo}
          canUndo={canUndo}
          isPlayerTurn={isPlayerTurn}
        />
      </div>
    </div>
  );
}
