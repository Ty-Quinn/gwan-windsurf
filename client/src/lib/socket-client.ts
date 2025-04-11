import { io, Socket } from 'socket.io-client';

// Define the events that the server can send to the client
interface ServerToClientEvents {
  'connection:established': (data: { userId: string }) => void;
  'game:state': (gameState: any) => void;
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

// Define the events that the client can send to the server
interface ClientToServerEvents {
  'user:register': (data: { username: string }, callback: (response: { success: boolean; userId?: string; error?: string }) => void) => void;
  'game:join': (data: { gameId: string }, callback: (response: { success: boolean; gameId?: string; error?: string }) => void) => void;
  'game:create': (callback: (response: { success: boolean; gameId?: string; error?: string }) => void) => void;
  'game:leave': (callback: (response: { success: boolean; error?: string }) => void) => void;
  'game:playCard': (data: { cardIndex: number; targetRow?: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'game:endTurn': (callback: (response: { success: boolean; error?: string }) => void) => void;
  'game:undoLastAction': (callback: (response: { success: boolean; error?: string }) => void) => void;
  'game:blightCardSelect': (data: { blightCardId: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'game:diceRoll': (data: { result: number }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'game:heartbeatAck': (data: { timestamp: number }) => void;
}

type EventHandler<T = any> = (data: T) => void;

export class SocketClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private userId: string | null = null;
  private username: string | null = null;
  private gameId: string | null = null;
  private playerIndex: number = -1;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private autoReconnect: boolean = true;
  private gameState: any = null;
  private serverUrl: string = 'http://localhost:3000';

  constructor(serverUrl?: string) {
    if (serverUrl) {
      this.serverUrl = serverUrl;
    }
  }

  // Initialize the socket connection
  public connect(): void {
    if (this.socket) {
      console.log('Socket already connected');
      return;
    }

    console.log(`Connecting to Socket.IO server at ${this.serverUrl}`);

    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true
    });

    this.setupSocketEvents();
  }

  // Set up socket event listeners
  private setupSocketEvents(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emitEvent('connection:changed', true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`Disconnected from server: ${reason}`);
      this.isConnected = false;
      this.emitEvent('connection:changed', false);
      
      // Attempt to reconnect after a short delay if auto-reconnect is enabled
      if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          if (!this.isConnected && this.socket) {
            console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
            this.reconnectAttempts++;
            this.socket.connect();
          }
        }, 3000);
      }
    });

    // Handle connection errors
    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error.message);
      this.emitEvent('connection:error', { error: error.message });
      
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts && this.autoReconnect) {
        console.log('Maximum reconnection attempts reached. Stopping reconnection.');
        this.socket?.disconnect();
      }
    });

    // Game-specific events
    this.socket.on('game:state', (gameState) => {
      console.log('Received game state update');
      this.gameState = gameState;
      this.emitEvent('game:state', gameState);
    });

    this.socket.on('game:joined', (data) => {
      console.log(`Joined game ${data.gameId} as player ${data.playerIndex}`);
      this.gameId = data.gameId;
      this.playerIndex = data.playerIndex;
      this.emitEvent('game:joined', data);
    });

    this.socket.on('game:opponentJoined', (data) => {
      console.log(`Opponent joined: ${data.username}`);
      this.emitEvent('game:opponentJoined', data);
    });

    this.socket.on('game:opponentLeft', () => {
      console.log('Opponent left the game');
      this.emitEvent('game:opponentLeft', {});
    });

    this.socket.on('game:error', (data) => {
      console.error('Game error:', data.message);
      this.emitEvent('game:error', data);
    });

    this.socket.on('game:cardPlayed', (data) => {
      console.log(`Player ${data.playerIndex} played card ${data.cardIndex}${data.targetRow ? ` to ${data.targetRow}` : ''}`);
      this.emitEvent('game:cardPlayed', data);
    });

    this.socket.on('game:turnEnded', (data) => {
      console.log(`Player ${data.playerIndex}'s turn ended${data.reason ? ` (${data.reason})` : ''}`);
      this.emitEvent('game:turnEnded', data);
    });

    this.socket.on('game:roundEnded', (data) => {
      if (data.tied) {
        console.log('Round ended in a tie');
      } else {
        console.log(`Round ended. Winner: Player ${data.winner}`);
      }
      this.emitEvent('game:roundEnded', data);
    });

    this.socket.on('game:ended', (data) => {
      console.log(`Game ended. Winner: Player ${data.winner}`);
      this.emitEvent('game:ended', data);
    });

    this.socket.on('matchmaking:waiting', (data) => {
      console.log(`Waiting for opponent. Position in queue: ${data.position}`);
      this.emitEvent('matchmaking:waiting', data);
    });

    this.socket.on('matchmaking:found', (data) => {
      console.log(`Match found! Game ID: ${data.gameId}, Opponent: ${data.opponent}, You are player ${data.playerIndex}`);
      this.gameId = data.gameId;
      this.playerIndex = data.playerIndex;
      this.emitEvent('matchmaking:found', data);
    });

    this.socket.on('game:turnStarted', (data) => {
      console.log(`Player ${data.playerIndex}'s (${data.playerName}) turn started`);
      this.emitEvent('game:turnStarted', data);
    });

    this.socket.on('game:heartbeat', (data) => {
      // Respond to heartbeat to keep connection alive
      if (this.socket) {
        this.socket.emit('game:heartbeatAck', { timestamp: data.timestamp });
      }
      this.emitEvent('game:heartbeat', data);
    });

    this.socket.on('connection:established', (data) => {
      console.log('Connection established with ID:', data.userId);
      this.userId = data.userId;
      this.emitEvent('connection:established', { userId: data.userId });
    });
  }

  // Register a user
  public register(username: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      this.socket.emit('user:register', { username: username }, (response) => {
        if (response.success) {
          this.username = username;
          this.userId = response.userId || null;
          this.emitEvent('user:registered', { username: username, userId: response.userId });
        }
        resolve(response);
      });
    });
  }

  // Play a card
  public playCard(cardIndex: number, targetRow?: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected || !this.gameId) {
        resolve({ success: false, error: 'Not in a game' });
        return;
      }

      this.socket.emit('game:playCard', { cardIndex: cardIndex, targetRow: targetRow }, (response) => {
        resolve(response);
      });
    });
  }

  // End turn (pass)
  public endTurn(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected || !this.gameId) {
        resolve({ success: false, error: 'Not in a game' });
        return;
      }

      this.socket.emit('game:endTurn', (response) => {
        resolve(response);
      });
    });
  }

  // Undo last action
  public undoLastAction(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected || !this.gameId) {
        resolve({ success: false, error: 'Not in a game' });
        return;
      }

      this.socket.emit('game:undoLastAction', (response) => {
        resolve(response);
      });
    });
  }

  // Create a new game
  public createGame(): Promise<{ success: boolean; gameId?: string; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      this.socket.emit('game:create', (response) => {
        if (response.success && response.gameId) {
          this.gameId = response.gameId;
          this.playerIndex = 0; // Creator is always player 0
        }
        resolve(response);
      });
    });
  }

  // Join a game or matchmaking
  public joinGame(gameIdParam: string): Promise<{ success: boolean; gameId?: string; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      this.socket.emit('game:join', { gameId: gameIdParam }, (response) => {
        if (response.success) {
          this.gameId = gameIdParam;
          // Check if playerIndex exists in the response
          if (response && typeof response === 'object' && 'playerIndex' in response) {
            this.playerIndex = response.playerIndex as number;
          } else {
            this.playerIndex = 1; // Default to player 1 (joining player)
          }
        }
        resolve(response);
      });
    });
  }

  // Select a blight card
  public selectBlightCard(blightCardId: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected || !this.gameId) {
        resolve({ success: false, error: 'Not in a game' });
        return;
      }

      this.socket.emit('game:blightCardSelect', { blightCardId: blightCardId }, (response) => {
        resolve(response);
      });
    });
  }

  // Submit dice roll result
  public submitDiceRoll(result: number): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected || !this.gameId) {
        resolve({ success: false, error: 'Not in a game' });
        return;
      }

      this.socket.emit('game:diceRoll', { result: result }, (response) => {
        resolve(response);
      });
    });
  }

  // Leave the current game
  public leaveGame(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected || !this.gameId) {
        resolve({ success: false, error: 'Not in a game' });
        return;
      }

      this.socket.emit('game:leave', (response) => {
        if (response.success) {
          this.gameId = null;
          this.playerIndex = -1;
        }
        resolve(response);
      });
    });
  }

  // Disconnect from the server
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.gameId = null;
      this.playerIndex = -1;
      console.log('Disconnected from Socket.IO server');
    }
  }

  // Add event listener
  public on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.push(handler);
    }
  }

  // Remove event listener
  public off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Emit event to all registered handlers
  private emitEvent(event: string, data: any): void {
    if (!this.eventHandlers.has(event)) return;
    
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      }
    }
  }

  // Getters
  public getUserId(): string | null {
    return this.userId;
  }

  public getUsername(): string | null {
    return this.username;
  }

  public getGameId(): string | null {
    return this.gameId;
  }

  public getPlayerIndex(): number {
    return this.playerIndex;
  }

  public isSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Create a singleton instance
export const socketClient = new SocketClient('http://localhost:3000');

// Export types for use in other components
export type { ServerToClientEvents, ClientToServerEvents, EventHandler };
