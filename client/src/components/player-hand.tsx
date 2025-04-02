"use client"

import { useState, useEffect } from 'react'
import { Player } from "@/lib/types"
import CardComponent from "./card"
import DiscardPileModal from "./discard-pile-modal"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'

interface PlayerHandProps {
  currentPlayer: Player
  isCurrentTurn: boolean
  selectedCard: number | null
  handlePlayCard: (cardIndex: number) => void
  handlePass: () => void
  switchPlayerView?: () => void
  handleUndo?: () => void
  canUndo?: boolean
}

export default function PlayerHand({
  currentPlayer,
  isCurrentTurn,
  selectedCard,
  handlePlayCard,
  handlePass,
  switchPlayerView,
  handleUndo,
  canUndo,
}: PlayerHandProps) {
  const [justSwitched, setJustSwitched] = useState(false);
  const [showDiscardPile, setShowDiscardPile] = useState(false);

  // Handle the End Turn animation effect
  const handleEndTurn = () => {
    if (switchPlayerView) {
      setJustSwitched(true);
      switchPlayerView();
      
      // Reset animation state after animation completes
      setTimeout(() => {
        setJustSwitched(false);
      }, 1000);
    }
  };

  return (
    <div className="mt-10 relative isolate">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Hand</h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {/* Undo button */}
            {handleUndo && (
              <motion.div
                whileHover={{ scale: canUndo ? 1.05 : 1 }}
                whileTap={{ scale: canUndo ? 0.95 : 1 }}
                className="relative"
              >
                <Button 
                  onClick={handleUndo}
                  disabled={!canUndo}
                  variant="outline"
                  className="relative"
                >
                  Undo Last Card
                </Button>
              </motion.div>
            )}
          
            <Button 
              onClick={handlePass}
              disabled={!isCurrentTurn || currentPlayer.pass}
              variant="destructive"
              className="relative"
            >
              Pass Turn
            </Button>
            
            {switchPlayerView && (
              <AnimatePresence>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Button 
                    onClick={handleEndTurn}
                    variant="secondary"
                    className="relative overflow-hidden"
                  >
                    <span className="z-10 relative">End Turn</span>
                    
                    {/* Pulse effect only if it's current turn and player has played at least one card */}
                    <AnimatePresence>
                      {isCurrentTurn && 
                        // Check if player has already played cards (hand size is less than max)
                        currentPlayer.hand.length < 10 && !currentPlayer.pass && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: [1, 1.2, 1.2, 1], 
                            opacity: [0.7, 0.5, 0.5, 0.7] 
                          }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ 
                            duration: 2,
                            repeat: 2,
                            repeatType: "loop"
                          }}
                          className="absolute inset-0 bg-primary rounded-md"
                          style={{ zIndex: 0 }}
                        />
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </AnimatePresence>
            )}

          </div>
          <div className="flex flex-col text-sm text-muted-foreground items-end">
            <div>{currentPlayer.hand.length} cards in hand</div>
            <div 
              className="cursor-pointer hover:text-primary flex items-center"
              onClick={() => setShowDiscardPile(true)}
            >
              {currentPlayer.discardPile.length} cards in discard pile
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
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
      
      {/* Discard pile modal */}
      {showDiscardPile && (
        <DiscardPileModal
          player={currentPlayer}
          onClose={() => setShowDiscardPile(false)}
        />
      )}
    </div>
  )
}