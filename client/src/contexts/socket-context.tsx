import React, { createContext, useEffect, useState } from 'react';
import { SocketClient } from '../lib/socket-client';

// Create the context with a default empty object
export const SocketContext = createContext<SocketClient | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
  serverUrl: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, serverUrl }) => {
  const [socketClient, setSocketClient] = useState<SocketClient | null>(null);

  useEffect(() => {
    // Initialize the socket client
    const client = new SocketClient(serverUrl);
    
    // Connect to the server
    client.connect();
    
    // Set the socket client in state
    setSocketClient(client);
    
    // Clean up on unmount
    return () => {
      client.disconnect();
    };
  }, [serverUrl]);

  return (
    <SocketContext.Provider value={socketClient}>
      {children}
    </SocketContext.Provider>
  );
};
