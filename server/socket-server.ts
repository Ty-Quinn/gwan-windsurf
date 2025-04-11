import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { log } from './vite';
import { GameState, Card, Player } from '../client/src/lib/types';
import { MultiplayerGameLogic } from '../client/src/lib/game-logic-multiplayer';

// Define Socket.IO event interfaces
interface ServerToClientEvents {
  'connection:established': (data: { userId: string }) => void;
  'game:state': (gameState: GameState) => void;
  'game:joined': (data: { gameId: string; playerIndex: number }) => void;
  'game:opponentJoined': (data: { username: string }) => void;
  'game:opponentLeft': () => void;
  'game:error': (data: { message: string }) => void;
  'game:cardPlayed': (data: { playerIndex: number; cardIndex: number; targetRow?: string }) => void;
  'game:turnEnded': (data: { playerIndex: number; reason?: string }) => void;
  'game:roundEnded': (data: { winner?: number; tied: boolean }) => void;
  'game:ended': (data: { winner: number }) => void;
  'matchmaking:waiting': (data: { position: number }) => void;
  'matchmaking:found': (data: { gameId: string; opponent: string; playerIndex: number }) => void;
  'game:turnStarted': (data: { playerIndex: number; playerName: string }) => void;
  'game:heartbeat': (data: { timestamp: number }) => void;
}

interface ClientToServerEvents {
  'user:register': (data: { username: string }, callback: (response: { success: boolean; userId?: string; error?: string }) => void) => void;
  'game:join': (data: { gameId?: string }, callback: (response: { success: boolean; gameId?: string; error?: string }) => void) => void;
  'game:create': (callback: (response: { success: boolean; gameId?: string; error?: string }) => void) => void;
  'game:leave': (callback: (response: { success: boolean }) => void) => void;
  'game:playCard': (data: { cardIndex: number; targetRow?: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'game:endTurn': (callback: (response: { success: boolean; error?: string }) => void) => void;
  'game:undoLastAction': (callback: (response: { success: boolean; error?: string }) => void) => void;
  'game:blightCardSelect': (data: { blightCardId: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'game:diceRoll': (data: { result: number }, callback: (response: { success: boolean; error?: string }) => void) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
  username?: string;
  gameId?: string;
  playerIndex?: number;
}

// Game instance interface
interface GameInstance {
  id: string;
  gameLogic: MultiplayerGameLogic;
  players: {
    userId: string;
    username: string;
    socketId: string;
    connected: boolean;
    lastAction?: {
      cardIndex: number;
      card: Card;
      targetRow: string | null;
    };
  }[];
  spectators: string[];
  lastUpdateTime: number;
  turnTimeLimit?: number;
  turnStartTime?: number;
}

export class SocketManager {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private games: Map<string, GameInstance> = new Map();
  private users: Map<string, { socketId: string; username: string }> = new Map();
  private waitingPlayers: { userId: string; username: string; socketId: string }[] = [];

  constructor(server: HttpServer) {
    this.io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['websocket'],
      path: '/socket.io',
      pingTimeout: 30000,
      pingInterval: 25000
    });

    this.setupSocketServer();
    log('Socket.IO server initialized');
  }

  private setupSocketServer(): void {
    this.io.on('connection', (socket) => {
      const userId = this.generateId();
      socket.data.userId = userId;
      
      log(`Client connected: ${userId} (${socket.id})`);

      // Send initial connection confirmation
      socket.emit('connection:established', { userId });

      // Register event handlers
      this.registerEventHandlers(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Set up periodic game state updates
      this.setupPeriodicUpdates(socket);
    });
  }

  private registerEventHandlers(socket: any): void {
    // User registration
    socket.on('user:register', (data: { username: string }, callback: (response: { success: boolean; userId?: string; error?: string }) => void) => {
      try {
        const { username } = data;
        if (!username || username.trim() === '') {
          return callback({ success: false, error: 'Username is required' });
        }

        // Store user information
        this.users.set(socket.data.userId, { 
          socketId: socket.id, 
          username 
        });
        socket.data.username = username;

        log(`User registered: ${username} (${socket.data.userId})`);
        callback({ success: true, userId: socket.data.userId });
      } catch (error) {
        log(`Error registering user: ${error}`);
        callback({ success: false, error: 'Failed to register user' });
      }
    });

    // Create a new game
    socket.on('game:create', (callback: (response: { success: boolean; gameId?: string; error?: string }) => void) => {
      try {
        if (!socket.data.username) {
          return callback({ success: false, error: 'You must register first' });
        }

        const gameId = this.generateId();
        const gameLogic = new MultiplayerGameLogic();
        gameLogic.initializeGame();

        // Create game instance
        this.games.set(gameId, {
          id: gameId,
          gameLogic,
          players: [{
            userId: socket.data.userId,
            username: socket.data.username,
            socketId: socket.id,
            connected: true
          }],
          spectators: [],
          lastUpdateTime: Date.now()
        });

        // Join socket to game room
        socket.join(gameId);
        socket.data.gameId = gameId;
        socket.data.playerIndex = 0;

        log(`Game created: ${gameId} by ${socket.data.username}`);
        callback({ success: true, gameId });
      } catch (error) {
        log(`Error creating game: ${error}`);
        callback({ success: false, error: 'Failed to create game' });
      }
    });

    // Join an existing game or matchmaking
    socket.on('game:join', (data: { gameId?: string }, callback: (response: { success: boolean; gameId?: string; error?: string }) => void) => {
      try {
        if (!socket.data.username) {
          return callback({ success: false, error: 'You must register first' });
        }

        // If gameId is provided, try to join that specific game
        if (data.gameId) {
          const game = this.games.get(data.gameId);
          if (!game) {
            return callback({ success: false, error: 'Game not found' });
          }

          // Check if game is full
          if (game.players.length >= 2) {
            // Join as spectator
            game.spectators.push(socket.id);
            socket.join(data.gameId);
            socket.data.gameId = data.gameId;
            
            log(`${socket.data.username} joined game ${data.gameId} as spectator`);
            callback({ success: true, gameId: data.gameId });
            
            // Send current game state to spectator
            socket.emit('game:state', game.gameLogic.getGameState());
            return;
          }

          // Join as player
          game.players.push({
            userId: socket.data.userId,
            username: socket.data.username,
            socketId: socket.id,
            connected: true
          });

          socket.join(data.gameId);
          socket.data.gameId = data.gameId;
          socket.data.playerIndex = 1;

          // Notify the other player
          this.io.to(game.players[0].socketId).emit('game:opponentJoined', {
            username: socket.data.username
          });

          // Initialize the game if both players are present
          if (game.players.length === 2) {
            game.gameLogic.initializeRound();
            
            // Send personalized game state to each player
            this.sendPersonalizedGameState(game);
            
            // Start the first turn
            this.startTurn(game);
          }

          log(`${socket.data.username} joined game ${data.gameId}`);
          callback({ success: true, gameId: data.gameId });
          
          // Emit joined event with player index
          socket.emit('game:joined', {
            gameId: data.gameId,
            playerIndex: 1
          });
          
          return;
        }

        // No gameId provided, add to matchmaking
        this.waitingPlayers.push({
          userId: socket.data.userId,
          username: socket.data.username,
          socketId: socket.id
        });

        // Notify player they're in queue
        socket.emit('matchmaking:waiting', {
          position: this.waitingPlayers.length
        });

        // Check if we can match players
        if (this.waitingPlayers.length >= 2) {
          const player1 = this.waitingPlayers.shift()!;
          const player2 = this.waitingPlayers.shift()!;
          
          // Create a new game
          const gameId = this.generateId();
          const gameLogic = new MultiplayerGameLogic();
          gameLogic.initializeGame();
          gameLogic.initializeRound();
          
          // Create game instance
          this.games.set(gameId, {
            id: gameId,
            gameLogic,
            players: [
              {
                userId: player1.userId,
                username: player1.username,
                socketId: player1.socketId,
                connected: true
              },
              {
                userId: player2.userId,
                username: player2.username,
                socketId: player2.socketId,
                connected: true
              }
            ],
            spectators: [],
            lastUpdateTime: Date.now()
          });
          
          // Join both sockets to game room
          this.io.sockets.sockets.get(player1.socketId)?.join(gameId);
          this.io.sockets.sockets.get(player2.socketId)?.join(gameId);
          
          // Update socket data
          this.io.sockets.sockets.get(player1.socketId)!.data.gameId = gameId;
          this.io.sockets.sockets.get(player1.socketId)!.data.playerIndex = 0;
          this.io.sockets.sockets.get(player2.socketId)!.data.gameId = gameId;
          this.io.sockets.sockets.get(player2.socketId)!.data.playerIndex = 1;
          
          // Notify both players
          this.io.to(player1.socketId).emit('matchmaking:found', {
            gameId,
            opponent: player2.username,
            playerIndex: 0
          });
          
          this.io.to(player2.socketId).emit('matchmaking:found', {
            gameId,
            opponent: player1.username,
            playerIndex: 1
          });
          
          // Send personalized game state to each player
          this.sendPersonalizedGameState(this.games.get(gameId)!);
          
          // Start the first turn
          this.startTurn(this.games.get(gameId)!);
          
          log(`Matched players: ${player1.username} and ${player2.username} in game ${gameId}`);
        }
        
        callback({ success: true });
      } catch (error) {
        log(`Error joining game: ${error}`);
        callback({ success: false, error: 'Failed to join game' });
      }
    });

    // Play a card
    socket.on('game:playCard', (data: { cardIndex: number; targetRow?: string }, callback: (response: { success: boolean; error?: string }) => void) => {
      try {
        if (!socket.data.gameId || socket.data.playerIndex === undefined) {
          return callback({ success: false, error: 'Not in a game' });
        }

        const game = this.games.get(socket.data.gameId);
        if (!game) {
          return callback({ success: false, error: 'Game not found' });
        }

        // Check if it's player's turn
        const gameState = game.gameLogic.getGameState();
        if (gameState.currentPlayer !== socket.data.playerIndex) {
          return callback({ success: false, error: 'Not your turn' });
        }

        // Play the card
        const result = game.gameLogic.playCard(
          socket.data.playerIndex,
          data.cardIndex,
          data.targetRow || null
        );

        if (!result.success) {
          return callback({ success: false, error: result.message });
        }

        // Store last action for potential undo
        const playerHand = gameState.players[socket.data.playerIndex].hand;
        if (data.cardIndex >= 0 && data.cardIndex < playerHand.length) {
          game.players[socket.data.playerIndex].lastAction = {
            cardIndex: data.cardIndex,
            card: JSON.parse(JSON.stringify(playerHand[data.cardIndex])),
            targetRow: data.targetRow || null
          };
        }

        // Broadcast the card play
        this.io.to(socket.data.gameId).emit('game:cardPlayed', {
          playerIndex: socket.data.playerIndex,
          cardIndex: data.cardIndex,
          targetRow: data.targetRow
        });

        // Send updated game state
        this.io.to(socket.data.gameId).emit('game:state', game.gameLogic.getGameState());

        // Check for round end
        if (result.roundWinner !== undefined || result.roundTied) {
          this.io.to(socket.data.gameId).emit('game:roundEnded', {
            winner: result.roundWinner,
            tied: result.roundTied || false
          });
        }

        // Check for game end
        if (result.gameEnded) {
          this.io.to(socket.data.gameId).emit('game:ended', {
            winner: result.roundWinner!
          });
        }

        callback({ success: true });
      } catch (error) {
        log(`Error playing card: ${error}`);
        callback({ success: false, error: 'Failed to play card' });
      }
    });

    // End turn (pass)
    socket.on('game:endTurn', (callback: (response: { success: boolean; error?: string }) => void) => {
      try {
        if (!socket.data.gameId || socket.data.playerIndex === undefined) {
          return callback({ success: false, error: 'Not in a game' });
        }

        const game = this.games.get(socket.data.gameId);
        if (!game) {
          return callback({ success: false, error: 'Game not found' });
        }

        // Check if it's player's turn
        const gameState = game.gameLogic.getGameState();
        if (gameState.currentPlayer !== socket.data.playerIndex) {
          return callback({ success: false, error: 'Not your turn' });
        }

        // Pass turn
        const result = game.gameLogic.pass(socket.data.playerIndex);

        if (!result.success) {
          return callback({ success: false, error: result.message });
        }

        // Clear last action since player passed
        game.players[socket.data.playerIndex].lastAction = undefined;

        // Broadcast the turn end
        this.io.to(socket.data.gameId).emit('game:turnEnded', {
          playerIndex: socket.data.playerIndex
        });

        // Send updated game state
        this.io.to(socket.data.gameId).emit('game:state', game.gameLogic.getGameState());

        // Check for round end
        if (result.roundWinner !== undefined || result.roundTied) {
          this.io.to(socket.data.gameId).emit('game:roundEnded', {
            winner: result.roundWinner,
            tied: result.roundTied || false
          });
        }

        // Check for game end
        if (result.gameEnded) {
          this.io.to(socket.data.gameId).emit('game:ended', {
            winner: result.roundWinner!
          });
        }

        callback({ success: true });
      } catch (error) {
        log(`Error ending turn: ${error}`);
        callback({ success: false, error: 'Failed to end turn' });
      }
    });

    // Undo last action
    socket.on('game:undoLastAction', (callback: (response: { success: boolean; error?: string }) => void) => {
      try {
        if (!socket.data.gameId || socket.data.playerIndex === undefined) {
          return callback({ success: false, error: 'Not in a game' });
        }

        const game = this.games.get(socket.data.gameId);
        if (!game) {
          return callback({ success: false, error: 'Game not found' });
        }

        // Check if player has a last action to undo
        const lastAction = game.players[socket.data.playerIndex].lastAction;
        if (!lastAction) {
          return callback({ success: false, error: 'No action to undo' });
        }

        // Check if it's still player's turn
        const gameState = game.gameLogic.getGameState();
        if (gameState.currentPlayer !== socket.data.playerIndex) {
          return callback({ success: false, error: 'Cannot undo after turn ended' });
        }

        // Perform the undo action
        const result = game.gameLogic.undoAction(socket.data.playerIndex, lastAction.cardIndex, lastAction.targetRow);
        
        if (!result.success) {
          return callback({ success: false, error: result.message || 'Failed to undo action' });
        }
        
        // Clear the last action
        game.players[socket.data.playerIndex].lastAction = undefined;
        
        // Send updated game state
        this.io.to(socket.data.gameId).emit('game:state', game.gameLogic.getGameState());
        
        callback({ success: true });
      } catch (error) {
        log(`Error undoing action: ${error}`);
        callback({ success: false, error: 'Failed to undo action' });
      }
    });

    // Blight card selection
    socket.on('game:blightCardSelect', (data: { blightCardId: string }, callback: (response: { success: boolean; error?: string }) => void) => {
      try {
        if (!socket.data.gameId || socket.data.playerIndex === undefined) {
          return callback({ success: false, error: 'Not in a game' });
        }

        const game = this.games.get(socket.data.gameId);
        if (!game) {
          return callback({ success: false, error: 'Game not found' });
        }

        // Check if it's player's turn
        const gameState = game.gameLogic.getGameState();
        if (gameState.currentPlayer !== socket.data.playerIndex) {
          return callback({ success: false, error: 'Not your turn' });
        }

        // Apply blight card effect
        const result = game.gameLogic.useBlightCard(socket.data.playerIndex, data.blightCardId);

        if (!result.success) {
          return callback({ success: false, error: result.message || 'Failed to use blight card' });
        }

        // Send updated game state
        this.io.to(socket.data.gameId).emit('game:state', game.gameLogic.getGameState());

        callback({ success: true });
      } catch (error) {
        log(`Error using blight card: ${error}`);
        callback({ success: false, error: 'Failed to use blight card' });
      }
    });

    // Dice roll handling
    socket.on('game:diceRoll', (data: { result: number }, callback: (response: { success: boolean; error?: string }) => void) => {
      try {
        if (!socket.data.gameId || socket.data.playerIndex === undefined) {
          return callback({ success: false, error: 'Not in a game' });
        }

        const game = this.games.get(socket.data.gameId);
        if (!game) {
          return callback({ success: false, error: 'Game not found' });
        }

        // Process dice roll result
        const result = game.gameLogic.processDiceRoll(socket.data.playerIndex, data.result);

        if (!result.success) {
          return callback({ success: false, error: result.message || 'Failed to process dice roll' });
        }

        // Send updated game state
        this.io.to(socket.data.gameId).emit('game:state', game.gameLogic.getGameState());

        callback({ success: true });
      } catch (error) {
        log(`Error processing dice roll: ${error}`);
        callback({ success: false, error: 'Failed to process dice roll' });
      }
    });

    // Leave game
    socket.on('game:leave', (callback: (response: { success: boolean }) => void) => {
      try {
        if (!socket.data.gameId) {
          return callback({ success: false });
        }

        this.leaveGame(socket);
        callback({ success: true });
      } catch (error) {
        log(`Error leaving game: ${error}`);
        callback({ success: false });
      }
    });
  }

  private handleDisconnect(socket: any): void {
    log(`Client disconnected: ${socket.data.userId || socket.id}`);

    // Handle game cleanup if in a game
    if (socket.data.gameId) {
      this.leaveGame(socket);
    }

    // Remove from waiting list if present
    const waitingIndex = this.waitingPlayers.findIndex(p => p.socketId === socket.id);
    if (waitingIndex >= 0) {
      this.waitingPlayers.splice(waitingIndex, 1);
    }

    // Remove user
    if (socket.data.userId) {
      this.users.delete(socket.data.userId);
    }
  }

  private leaveGame(socket: any): void {
    const gameId = socket.data.gameId;
    if (!gameId) return;

    const game = this.games.get(gameId);
    if (!game) return;

    // Check if player or spectator
    const playerIndex = game.players.findIndex(p => p.socketId === socket.id);
    const spectatorIndex = game.spectators.indexOf(socket.id);

    if (playerIndex >= 0) {
      // Mark player as disconnected
      game.players[playerIndex].connected = false;

      // Notify other player
      const otherPlayerIndex = playerIndex === 0 ? 1 : 0;
      if (game.players.length > otherPlayerIndex && game.players[otherPlayerIndex].connected) {
        this.io.to(game.players[otherPlayerIndex].socketId).emit('game:opponentLeft');
      }

      log(`Player ${socket.data.username || socket.id} left game ${gameId}`);
    } else if (spectatorIndex >= 0) {
      // Remove spectator
      game.spectators.splice(spectatorIndex, 1);
      log(`Spectator ${socket.data.username || socket.id} left game ${gameId}`);
    }

    // Leave socket room
    socket.leave(gameId);
    socket.data.gameId = undefined;
    socket.data.playerIndex = undefined;

    // Clean up empty games or games where both players disconnected
    if (game.players.length === 0 || game.players.every(p => !p.connected)) {
      this.games.delete(gameId);
      log(`Game ${gameId} removed (no active players)`);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  // Send personalized game state to each player
  private sendPersonalizedGameState(game: GameInstance): void {
    if (!game || game.players.length < 2) return;

    // Send game state to each player with opponent's hand hidden
    for (let i = 0; i < game.players.length; i++) {
      const playerSocketId = game.players[i].socketId;
      const socket = this.io.sockets.sockets.get(playerSocketId);
      
      if (socket && game.players[i].connected) {
        // Create a personalized game state for this player
        const gameState = game.gameLogic.getGameState();
        const personalizedState = {
          ...gameState,
          players: gameState.players.map((player, idx) => {
            // For opponent, hide their hand
            if (idx !== i) {
              return {
                ...player,
                hand: player.hand.map(() => ({ 
                  suit: 'joker' as const, 
                  value: '0',
                  baseValue: 0,
                  isCommander: false,
                  isWeather: false,
                  isSpy: false,
                  isMedic: false
                }))
              };
            }
            return player;
          }),
          playerView: i // Add player's view index
        };
        
        // Send personalized state to this player
        socket.emit('game:state', personalizedState);
      }
    }
  }

  // Start a new turn
  private startTurn(game: GameInstance): void {
    if (!game) return;
    
    const gameState = game.gameLogic.getGameState();
    const currentPlayerIndex = gameState.currentPlayer;
    
    if (currentPlayerIndex < 0 || currentPlayerIndex >= game.players.length) return;
    
    const currentPlayerSocketId = game.players[currentPlayerIndex].socketId;
    
    // Notify all players whose turn it is
    this.io.to(game.id).emit('game:turnStarted', {
      playerIndex: currentPlayerIndex,
      playerName: game.players[currentPlayerIndex].username
    });
    
    // Start turn timer if configured
    if (game.turnTimeLimit) {
      game.turnStartTime = Date.now();
      
      // Set a timeout to auto-pass if player doesn't act
      setTimeout(() => {
        // Check if it's still the same player's turn
        const currentState = game.gameLogic.getGameState();
        if (currentState.currentPlayer === currentPlayerIndex) {
          // Auto-pass for this player
          const result = game.gameLogic.pass(currentPlayerIndex);
          
          // Notify players of auto-pass
          this.io.to(game.id).emit('game:turnEnded', {
            playerIndex: currentPlayerIndex,
            reason: 'timeout'
          });
          
          // Send updated game state
          this.sendPersonalizedGameState(game);
          
          // Check for round end
          if (result.roundWinner !== undefined || result.roundTied) {
            this.io.to(game.id).emit('game:roundEnded', {
              winner: result.roundWinner,
              tied: result.roundTied || false
            });
          }
          
          // Check for game end
          if (result.gameEnded) {
            this.io.to(game.id).emit('game:ended', {
              winner: result.roundWinner!
            });
          } else if (!result.roundWinner && !result.roundTied) {
            // Start next turn
            this.startTurn(game);
          }
        }
      }, game.turnTimeLimit);
    }
  }

  // Set up periodic game state updates
  private setupPeriodicUpdates(socket: any): void {
    // Every 30 seconds, check if the player is in a game and send an update
    const interval = setInterval(() => {
      if (!socket.connected) {
        clearInterval(interval);
        return;
      }
      
      const gameId = socket.data.gameId;
      if (gameId) {
        const game = this.games.get(gameId);
        if (game) {
          // Send a heartbeat to keep the connection alive
          socket.emit('game:heartbeat', { timestamp: Date.now() });
          
          // If the player is in a game, send an updated game state
          if (socket.data.playerIndex !== undefined) {
            const playerIndex = socket.data.playerIndex;
            const gameState = game.gameLogic.getGameState();
            
            // Create a personalized state for this player
            const personalizedState = {
              ...gameState,
              players: gameState.players.map((player, idx) => {
                // For opponent, hide their hand
                if (idx !== playerIndex) {
                  return {
                    ...player,
                    hand: player.hand.map(() => ({ 
                      suit: 'joker' as const, 
                      value: '0', 
                      baseValue: 0,
                      isCommander: false,
                      isWeather: false,
                      isSpy: false,
                      isMedic: false
                    }))
                  };
                }
                return player;
              }),
              playerView: playerIndex
            };
            
            socket.emit('game:state', personalizedState);
          }
        }
      }
    }, 30000); // Every 30 seconds
    
    // Clean up interval on disconnect
    socket.on('disconnect', () => {
      clearInterval(interval);
    });
  }

  // Public methods for server integration
  public getConnectedClients(): number {
    return this.io.sockets.sockets.size;
  }

  public getActiveGames(): number {
    return this.games.size;
  }
}
