import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../contexts/socket-context';
import { SocketClient } from '../../lib/socket-client';

interface TurnIndicatorProps {
  currentPlayer: number;
  playerIndex: number;
  playerNames: string[];
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({ 
  currentPlayer, 
  playerIndex, 
  playerNames 
}) => {
  const [turnMessage, setTurnMessage] = useState<string>('');
  const [isYourTurn, setIsYourTurn] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const socketClient = useContext(SocketContext);
  
  useEffect(() => {
    // Set turn message based on whose turn it is
    const isCurrentPlayersTurn = currentPlayer === playerIndex;
    setIsYourTurn(isCurrentPlayersTurn);
    
    if (isCurrentPlayersTurn) {
      setTurnMessage('Your turn');
    } else if (currentPlayer >= 0 && currentPlayer < playerNames.length) {
      setTurnMessage(`${playerNames[currentPlayer]}'s turn`);
    } else {
      setTurnMessage('Waiting for game to start...');
    }
    
    // Set up timer if it's a timed turn
    if (isCurrentPlayersTurn && timeLeft === null) {
      setTimeLeft(30); // Default 30 second timer
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentPlayer, playerIndex, playerNames, timeLeft]);
  
  // Listen for turn events from the socket
  useEffect(() => {
    if (!socketClient) return;
    
    const handleTurnStarted = (data: { playerIndex: number; playerName: string }) => {
      if (data.playerIndex === playerIndex) {
        setTimeLeft(30); // Reset timer when your turn starts
      }
    };
    
    const handleTurnEnded = () => {
      setTimeLeft(null);
    };
    
    // Add event listeners
    socketClient.on('game:turnStarted', handleTurnStarted);
    socketClient.on('game:turnEnded', handleTurnEnded);
    
    return () => {
      // Clean up event listeners
      if (socketClient) {
        socketClient.off('game:turnStarted', handleTurnStarted);
        socketClient.off('game:turnEnded', handleTurnEnded);
      }
    };
  }, [socketClient, playerIndex]);
  
  return (
    <div className={`turn-indicator ${isYourTurn ? 'your-turn' : ''}`}>
      <div className="turn-message">{turnMessage}</div>
      {timeLeft !== null && (
        <div className="turn-timer">
          Time left: {timeLeft}s
        </div>
      )}
      <style>{`
        .turn-indicator {
          background-color: #2c3e50;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .your-turn {
          background-color: #27ae60;
          animation: pulse 1.5s infinite;
        }
        
        .turn-message {
          font-weight: bold;
        }
        
        .turn-timer {
          font-size: 0.9em;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(39, 174, 96, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(39, 174, 96, 0);
          }
        }
      `}</style>
    </div>
  );
};
