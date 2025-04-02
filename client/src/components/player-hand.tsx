"use client"

import { Player } from "@/lib/types"
import CardComponent from "./card"
import { Button } from "@/components/ui/button"

interface PlayerHandProps {
  currentPlayer: Player
  isCurrentTurn: boolean
  selectedCard: number | null
  handlePlayCard: (cardIndex: number) => void
  handlePass: () => void
  switchPlayerView?: () => void  // Added for End Turn button
}

export default function PlayerHand({
  currentPlayer,
  isCurrentTurn,
  selectedCard,
  handlePlayCard,
  handlePass,
  switchPlayerView,
}: PlayerHandProps) {
  return (
    <div className="mt-10 relative isolate">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Hand</h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <Button 
              onClick={handlePass}
              disabled={!isCurrentTurn || currentPlayer.pass}
              variant="destructive"
            >
              Pass Turn
            </Button>
            {switchPlayerView && (
              <Button 
                onClick={switchPlayerView}
                variant="secondary"
              >
                End Turn
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {currentPlayer.hand.length} cards remaining
          </div>
        </div>
      </div>
      
      {/* This hidden div ensures that no card details leak outside their containers */}
      <div className="hidden absolute -top-96 left-0 right-0 opacity-0 pointer-events-none">
        {currentPlayer.hand.map((card) => (
          <span key={`label-blocker-${card.suit}-${card.value}`}>{card.suit}-{card.value}</span>
        ))}
      </div>
      
      <div className="flex flex-wrap items-center justify-center py-6 px-2 gap-4 relative overflow-visible">
        {currentPlayer.hand.map((card, index) => (
          <div key={`hand-card-wrapper-${index}`} className="relative overflow-visible">
            <CardComponent
              key={`hand-${index}`}
              card={card}
              selected={selectedCard === index}
              onClick={() => isCurrentTurn && !currentPlayer.pass && handlePlayCard(index)}
              disabled={!isCurrentTurn || currentPlayer.pass}
            />
          </div>
        ))}
      </div>
    </div>
  )
}