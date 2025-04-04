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
  showBlightCard?: () => void
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
  showBlightCard,
}: PlayerHandProps) {
  const [justSwitched, setJustSwitched] = useState(false);
  const [showDiscardPile, setShowDiscardPile] = useState(false);
  const [hasPlayedCardThisTurn, setHasPlayedCardThisTurn] = useState(false);

  // Wrapper for handling card plays to track when a card is played
  const handleCardPlay = (cardIndex: number) => {
    handlePlayCard(cardIndex);
    setHasPlayedCardThisTurn(true);
  };
  
  // Handle the End Turn animation effect
  const handleEndTurn = () => {
    if (switchPlayerView) {
      setJustSwitched(true);
      switchPlayerView();
      setHasPlayedCardThisTurn(false); // Reset the state when turn ends
      
      // Reset animation state after animation completes
      setTimeout(() => {
        setJustSwitched(false);
      }, 1000);
    }
  };

  return (
    <div className="mt-10 relative isolate gwan-board-container p-4">
      <div className="flex items-center justify-between mb-6 border-b border-amber-800/40 pb-3">
        <h2 className="text-xl font-medieval text-amber-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-400"><path d="M9.5 14.5 3 21"/><path d="M9.5 14.5 21 3"/><path d="M9.5 14.5 14.5 9.5"/><path d="M14.5 9.5 21 3"/><path d="M14.5 9.5 17.5 6.5"/><path d="M6.5 17.5l3-3"/><path d="M3 21a8 8 0 0 0 4-1 8 8 0 0 1 8-7 8 8 0 0 1 6 3 8 8 0 0 0 0-10 4 4 0 0 0-6 0c-2 2-4 4-4 6-1.1 2-2 5.5-8 5.5l-3 3"/></svg>
          Your Arsenal
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-3">
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
                  className="relative border-amber-700/50 font-serif text-amber-200"
                >
                  ↩ Recall Card
                </Button>
              </motion.div>
            )}
          
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button 
                onClick={() => {
                  handlePass();
                  setHasPlayedCardThisTurn(false); // Reset card played state when passing
                }}
                disabled={!isCurrentTurn || currentPlayer.pass}
                variant="destructive"
                className="relative overflow-hidden bg-red-900 border border-red-700 text-amber-100 hover:bg-red-800 font-medieval"
              >
                <span className="z-10 relative">Pass</span>
                
                {/* Pulse effect only if opponent has already passed */}
                <AnimatePresence>
                  {isCurrentTurn && 
                    // Highlight pass button when opponent has passed and this player can still play
                    !currentPlayer.pass && (
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
                      className="absolute inset-0 bg-red-700/40 rounded-md"
                      style={{ zIndex: 0 }}
                    />
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
            
            {/* Blight Card Button */}
            {showBlightCard && currentPlayer.blightCard && !currentPlayer.hasUsedBlightCard && isCurrentTurn && !currentPlayer.pass && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button 
                  onClick={() => {
                    if (showBlightCard) showBlightCard();
                    setHasPlayedCardThisTurn(true); // Casting blight magic counts as playing a card
                  }}
                  variant="outline"
                  className="relative bg-gradient-to-b from-amber-950 to-amber-900 text-amber-100 hover:from-amber-900 hover:to-amber-800 border-amber-700 font-medieval"
                >
                  <span className="z-10 relative flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-amber-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Cast Blight Magic
                  </span>
                  
                  {/* Pulse effect for Blight Card button */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [1, 1.2, 1.2, 1], 
                      opacity: [0.7, 0.5, 0.5, 0.7] 
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                    className="absolute inset-0 bg-amber-600/30 rounded-md"
                    style={{ zIndex: 0 }}
                  />
                </Button>
              </motion.div>
            )}
            
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
                    className="relative overflow-hidden bg-gradient-to-b from-emerald-950 to-emerald-900 text-amber-100 border border-emerald-700 hover:from-emerald-900 hover:to-emerald-800 font-medieval"
                  >
                    <span className="z-10 relative">End Turn</span>
                    
                    {/* Pulse effect only if it's current turn and player has played at least one card */}
                    <AnimatePresence>
                      {isCurrentTurn && 
                        !currentPlayer.pass && 
                        // Only pulse if player has played a card in this turn
                        hasPlayedCardThisTurn && (
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
                          className="absolute inset-0 bg-emerald-700/30 rounded-md"
                          style={{ zIndex: 0 }}
                        />
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </AnimatePresence>
            )}

          </div>
          <div className="flex flex-col text-sm items-end pr-2 border-l border-amber-800/30 pl-4">
            <div className="font-serif text-amber-100">{currentPlayer.hand.length} cards in arsenal</div>
            <div 
              className="cursor-pointer hover:text-amber-400 flex items-center text-amber-200/80 font-serif transition-colors"
              onClick={() => setShowDiscardPile(true)}
            >
              {currentPlayer.discardPile.length} cards in graveyard
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            {/* Blight card info */}
            {currentPlayer.blightCard && (
              <div className={`mt-1 flex items-center ${currentPlayer.hasUsedBlightCard ? 'text-amber-500/40' : 'text-amber-500'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span className="text-xs font-serif">
                  {currentPlayer.hasUsedBlightCard ? 'Magic depleted' : currentPlayer.blightCard.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* This hidden div ensures that no card details leak outside their containers */}
      <div className="hidden absolute -top-96 left-0 right-0 opacity-0 pointer-events-none">
        {currentPlayer.hand.map((card, index) => (
          <span key={`label-blocker-${card.suit}-${card.value}-${index}`}>{card.suit}-{card.value}</span>
        ))}
      </div>
      
      <div className="flex flex-wrap items-center justify-center py-6 px-2 gap-5 relative overflow-visible">
        {currentPlayer.hand.map((card, index) => (
          <div key={`hand-card-wrapper-${index}`} className="relative overflow-visible">
            <CardComponent
              key={`hand-${index}`}
              card={card}
              selected={selectedCard === index}
              onClick={() => isCurrentTurn && !currentPlayer.pass && handleCardPlay(index)}
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