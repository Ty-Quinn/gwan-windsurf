import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { log } from './vite';
import { GameState } from '../client/src/lib/types';

interface Client {
  ws: WebSocket;
  id: string;
  username?: string;
  gameId?: string;
}

interface Game {
  id: string;
  players: string[];
  gameState: GameState;
  spectators: string[];
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  private games: Map<string, Game> = new Map();
  private waitingPlayers: string[] = [];

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
    log('WebSocket server initialized');
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateId();
      this.clients.set(clientId, { ws, id: clientId });
      
      log(`Client connected: ${clientId}`);

      // Send client their ID
      this.sendToClient(clientId, {
        type: 'connection',
        data: { id: clientId }
      });

      ws.on('message', (message: string) => {
        try {
          const parsedMessage = JSON.parse(message);
          this.handleMessage(clientId, parsedMessage);
        } catch (error) {
          log(`Error parsing message: ${error}`);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });
    });
  }

  private handleMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'register':
        this.registerUser(clientId, message.data.username);
        break;
      
      case 'findGame':
        this.findGame(clientId);
        break;
      
      case 'createGame':
        this.createGame(clientId);
        break;
      
      case 'joinGame':
        this.joinGame(clientId, message.data.gameId);
        break;
      
      case 'gameAction':
        this.handleGameAction(clientId, message.data);
        break;
      
      case 'leaveGame':
        this.leaveGame(clientId);
        break;
      
      default:
        log(`Unknown message type: ${message.type}`);
    }
  }

  private registerUser(clientId: string, username: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.username = username;
      this.sendToClient(clientId, {
        type: 'registered',
        data: { id: clientId, username }
      });
      log(`User registered: ${username} (${clientId})`);
    }
  }

  private findGame(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client || !client.username) return;

    // Add to waiting list
    this.waitingPlayers.push(clientId);
    
    // Check if we have enough players to start a game
    if (this.waitingPlayers.length >= 2) {
      const player1Id = this.waitingPlayers.shift()!;
      const player2Id = this.waitingPlayers.shift()!;
      
      // Create a new game
      const gameId = this.generateId();
      const player1 = this.clients.get(player1Id)!;
      const player2 = this.clients.get(player2Id)!;
      
      // Create game
      this.games.set(gameId, {
        id: gameId,
        players: [player1Id, player2Id],
        gameState: {} as GameState, // This will be initialized by the first player
        spectators: []
      });
      
      // Update clients with game info
      player1.gameId = gameId;
      player2.gameId = gameId;
      
      // Notify players
      this.sendToClient(player1Id, {
        type: 'gameFound',
        data: { 
          gameId,
          opponent: player2.username,
          playerIndex: 0
        }
      });
      
      this.sendToClient(player2Id, {
        type: 'gameFound',
        data: { 
          gameId,
          opponent: player1.username,
          playerIndex: 1
        }
      });
      
      log(`Game created: ${gameId} between ${player1.username} and ${player2.username}`);
    } else {
      // Notify player they're waiting
      this.sendToClient(clientId, {
        type: 'waiting',
        data: { position: this.waitingPlayers.length }
      });
      
      log(`Player ${client.username} (${clientId}) waiting for opponent`);
    }
  }

  private createGame(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client || !client.username) return;
    
    const gameId = this.generateId();
    
    // Create game
    this.games.set(gameId, {
      id: gameId,
      players: [clientId],
      gameState: {} as GameState,
      spectators: []
    });
    
    client.gameId = gameId;
    
    // Notify player
    this.sendToClient(clientId, {
      type: 'gameCreated',
      data: { 
        gameId,
        playerIndex: 0
      }
    });
    
    log(`Game created: ${gameId} by ${client.username} (${clientId})`);
  }

  private joinGame(clientId: string, gameId: string): void {
    const client = this.clients.get(clientId);
    const game = this.games.get(gameId);
    
    if (!client || !client.username || !game) return;
    
    // Check if game is full
    if (game.players.length >= 2) {
      // Add as spectator
      game.spectators.push(clientId);
      client.gameId = gameId;
      
      this.sendToClient(clientId, {
        type: 'joinedAsSpectator',
        data: { 
          gameId,
          players: game.players.map(playerId => {
            const player = this.clients.get(playerId);
            return player?.username || 'Unknown';
          })
        }
      });
      
      log(`${client.username} (${clientId}) joined game ${gameId} as spectator`);
      return;
    }
    
    // Join as player
    game.players.push(clientId);
    client.gameId = gameId;
    
    const player1Id = game.players[0];
    const player1 = this.clients.get(player1Id);
    
    // Notify both players
    this.sendToClient(player1Id, {
      type: 'opponentJoined',
      data: { 
        opponent: client.username,
        playerIndex: 0
      }
    });
    
    this.sendToClient(clientId, {
      type: 'joinedGame',
      data: { 
        gameId,
        opponent: player1?.username,
        playerIndex: 1
      }
    });
    
    log(`${client.username} (${clientId}) joined game ${gameId}`);
  }

  private handleGameAction(clientId: string, data: any): void {
    const client = this.clients.get(clientId);
    if (!client || !client.gameId) return;
    
    const game = this.games.get(client.gameId);
    if (!game) return;
    
    // Update game state
    if (data.gameState) {
      game.gameState = data.gameState;
    }
    
    // Forward action to other player
    const otherPlayerId = game.players.find(id => id !== clientId);
    if (otherPlayerId) {
      this.sendToClient(otherPlayerId, {
        type: 'gameAction',
        data
      });
    }
    
    // Forward to spectators
    game.spectators.forEach(spectatorId => {
      this.sendToClient(spectatorId, {
        type: 'gameAction',
        data
      });
    });
    
    log(`Game action in ${client.gameId} by ${client.username || clientId}`);
  }

  private leaveGame(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client || !client.gameId) return;
    
    const game = this.games.get(client.gameId);
    if (!game) return;
    
    // Remove from game
    const playerIndex = game.players.indexOf(clientId);
    const spectatorIndex = game.spectators.indexOf(clientId);
    
    if (playerIndex >= 0) {
      game.players.splice(playerIndex, 1);
      
      // Notify other player
      const otherPlayerId = game.players[0];
      if (otherPlayerId) {
        this.sendToClient(otherPlayerId, {
          type: 'opponentLeft',
          data: {}
        });
      }
      
      log(`Player ${client.username || clientId} left game ${client.gameId}`);
    } else if (spectatorIndex >= 0) {
      game.spectators.splice(spectatorIndex, 1);
      log(`Spectator ${client.username || clientId} left game ${client.gameId}`);
    }
    
    // Clean up empty games
    if (game.players.length === 0) {
      this.games.delete(client.gameId);
      log(`Game ${client.gameId} removed (no players left)`);
    }
    
    // Clear client's game reference
    client.gameId = undefined;
  }

  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // Handle game cleanup
    if (client.gameId) {
      this.leaveGame(clientId);
    }
    
    // Remove from waiting list if present
    const waitingIndex = this.waitingPlayers.indexOf(clientId);
    if (waitingIndex >= 0) {
      this.waitingPlayers.splice(waitingIndex, 1);
    }
    
    // Remove client
    this.clients.delete(clientId);
    log(`Client disconnected: ${client.username || clientId}`);
  }

  private sendToClient(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  // Public methods for server integration
  public getConnectedClients(): number {
    return this.clients.size;
  }

  public getActiveGames(): number {
    return this.games.size;
  }
}
