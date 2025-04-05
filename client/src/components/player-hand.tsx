'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, Player, BlightCard } from "@/lib/types";
import CardComponent from "./card";
import { Sword, Hand, RotateCcw, Sparkles, EyeOff } from "lucide-react";

interface PlayerHandProps {
  currentPlayer: Player;
  isCurrentTurn: boolean;
  selectedCard: number | null;
  handlePlayCard: (cardIndex: number) => void;
  handlePass: () => void;
  switchPlayerView: () => void;
  canUndo: boolean;
  handleUndo: () => void;
  showBlightCard: () => void;
}

export default function PlayerHand({
  currentPlayer,
  isCurrentTurn,
  selectedCard,
  handlePlayCard,
  handlePass,
  switchPlayerView,
  canUndo,
  handleUndo,
  showBlightCard
}: PlayerHandProps) {
  const [showCardDetails, setShowCardDetails] = useState<boolean>(false);
  
  // Check if player has any unused blight cards
  const hasUnusedBlightCards = currentPlayer.blightCards.some(card => !card.used);
  
  return (
    <div className="player-hand-container p-4 bg-black/50 rounded-xl backdrop-blur-md border border-amber-900/30">
      <div className="flex justify-between mb-4">
        <h3 className="text-amber-200 text-lg font-semibold">
          {currentPlayer.name}'s Hand ({currentPlayer.hand.length})
        </h3>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="border-amber-500/30 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100"
            onClick={switchPlayerView}
          >
            <EyeOff className="mr-2 h-4 w-4" />
            Switch View
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {currentPlayer.hand.map((card, index) => (
          <div key={`${card.suit}-${card.value}-${index}`} className="relative">
            <CardComponent
              card={card}
              selected={selectedCard === index}
              onClick={() => isCurrentTurn && handlePlayCard(index)}
              disabled={!isCurrentTurn}
              compact={currentPlayer.hand.length > 8}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-between mt-4 flex-wrap gap-2">
        <div className="flex gap-2">
          <Button
            variant="default"
            className={`${!isCurrentTurn ? 'opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500'} text-amber-100 border-none`}
            onClick={() => isCurrentTurn && handlePass()}
            disabled={!isCurrentTurn}
          >
            <Hand className="mr-2 h-4 w-4" />
            Pass
          </Button>
          
          <Button
            variant="outline"
            className={`${!canUndo ? 'opacity-50 cursor-not-allowed' : ''} border-amber-500/50 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100`}
            onClick={handleUndo}
            disabled={!canUndo}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Undo
          </Button>
        </div>
        
        <Button
          variant={hasUnusedBlightCards && isCurrentTurn && !currentPlayer.hasUsedBlightThisTurn ? "default" : "outline"}
          className={`
            ${hasUnusedBlightCards && isCurrentTurn && !currentPlayer.hasUsedBlightThisTurn 
              ? 'bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-purple-100 border-none' 
              : 'border-purple-500/50 text-purple-200 hover:bg-purple-900/30 hover:text-purple-100'}
            ${(!hasUnusedBlightCards || !isCurrentTurn || currentPlayer.hasUsedBlightThisTurn) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={showBlightCard}
          disabled={!hasUnusedBlightCards || !isCurrentTurn || currentPlayer.hasUsedBlightThisTurn}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Cast Blight Magic
        </Button>
      </div>
    </div>
  );
}