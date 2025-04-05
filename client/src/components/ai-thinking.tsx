"use client"

import { useState, useEffect } from "react"
import { Brain } from "lucide-react"

interface AIThinkingProps {
  isThinking: boolean;
  message?: string;
}

/**
 * Component that displays an animated "thinking" indicator when the AI is making decisions
 */
export default function AIThinking({ isThinking, message = "AI is thinking..." }: AIThinkingProps) {
  const [dots, setDots] = useState(".");
  
  // Animate the dots
  useEffect(() => {
    if (!isThinking) return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ".";
        return prev + ".";
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, [isThinking]);
  
  if (!isThinking) return null;
  
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-amber-950 to-amber-900 p-6 rounded-lg shadow-lg w-full max-w-md text-center border-2 border-amber-700">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-10 w-10 text-amber-400 animate-pulse mr-2" />
          <h3 className="text-xl font-bold text-amber-200">AI OPPONENT</h3>
        </div>
        
        <div className="mb-4 flex flex-col items-center">
          <div className="flex space-x-2 mb-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="w-3 h-3 rounded-full bg-amber-400"
                style={{
                  opacity: dots.length > i ? 1 : 0.3,
                  transform: dots.length > i ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>
          <p className="text-amber-100 mt-2">{message}{dots}</p>
        </div>
      </div>
    </div>
  );
}