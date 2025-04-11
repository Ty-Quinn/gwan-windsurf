"use client"

import { useState, useContext } from 'react'
import { Card } from "../../lib/types"
import CardComponent from "./card"
import { Button } from "../../components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'
import { Undo2, SkipForward } from "lucide-react"
import { SocketContext } from "../../contexts/socket-context"

interface MultiplayerPlayerHandProps {
  hand: Card[]
  onPlayCard: (cardIndex: number, targetRow?: string) => void
  onPass: () => void
  onUndo: () => void
  canUndo: boolean
  isPlayerTurn: boolean
}

export default function MultiplayerPlayerHand({
  hand,
  onPlayCard,
  onPass,
  onUndo,
  canUndo,
  isPlayerTurn
}: MultiplayerPlayerHandProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null)
  const [targetRow, setTargetRow] = useState<string | null>(null)
  const [showRowSelection, setShowRowSelection] = useState<boolean>(false)
  const socketClient = useContext(SocketContext)

  const handleCardClick = (index: number) => {
    if (!isPlayerTurn) return
    
    // If card is already selected, check if it needs row selection
    if (selectedCardIndex === index) {
      // For cards that need row selection (like weather cards)
      if (hand[index].isWeather) {
        setShowRowSelection(true)
      } else {
        // For cards that don't need row selection
        onPlayCard(index)
        setSelectedCardIndex(null)
      }
    } else {
      // Otherwise, select it
      setSelectedCardIndex(index)
      setShowRowSelection(false)
    }
  }

  const handleCardHover = (index: number | null) => {
    setHoveredCardIndex(index)
  }

  const handlePlaySelectedCard = () => {
    if (selectedCardIndex !== null) {
      if (hand[selectedCardIndex].isWeather && !targetRow) {
        setShowRowSelection(true)
      } else {
        // Play the card with the target row if needed
        onPlayCard(selectedCardIndex)
        setSelectedCardIndex(null)
        setTargetRow(null)
        setShowRowSelection(false)
      }
    }
  }
  
  const handleRowSelect = (row: string) => {
    setTargetRow(row)
    if (selectedCardIndex !== null) {
      // Call the parent's onPlayCard with both card index and target row
      onPlayCard(selectedCardIndex, row)
      setSelectedCardIndex(null)
      setShowRowSelection(false)
    }
  }

  return (
    <div className="mt-8 p-4 bg-black/30 backdrop-blur-sm border border-amber-900/50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-amber-200">Your Hand</h3>
        <div className="flex space-x-2">
          {canUndo && (
            <Button
              variant="outline"
              size="sm"
              className="border-amber-500/50 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100"
              onClick={onUndo}
              disabled={!isPlayerTurn || !canUndo}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="border-amber-500/50 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100"
            onClick={onPass}
            disabled={!isPlayerTurn}
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Pass
          </Button>
        </div>
      </div>
      
      <div className="relative">
        {!isPlayerTurn && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <p className="text-amber-200 text-xl font-semibold">Waiting for opponent's turn...</p>
          </div>
        )}
        
        <div className="flex flex-wrap justify-center gap-2 min-h-[180px]">
          <AnimatePresence>
            {hand.map((card, index) => (
              <motion.div
                key={`${card.suit}-${card.value}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: selectedCardIndex === index ? 1.1 : 1,
                  zIndex: selectedCardIndex === index ? 10 : 1
                }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -10, zIndex: 5 }}
                className="cursor-pointer"
                onClick={() => handleCardClick(index)}
                onMouseEnter={() => handleCardHover(index)}
                onMouseLeave={() => handleCardHover(null)}
              >
                <CardComponent 
                  card={card} 
                  isSelected={selectedCardIndex === index}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      {selectedCardIndex !== null && (
        <div className="mt-4 flex flex-col items-center">
          {showRowSelection && hand[selectedCardIndex].isWeather ? (
            <div className="mb-4">
              <h4 className="text-amber-200 mb-2">Select target row:</h4>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleRowSelect('clubs')}
                  className="bg-amber-700 hover:bg-amber-600 text-amber-100"
                >
                  Infantry
                </Button>
                <Button 
                  onClick={() => handleRowSelect('spades')}
                  className="bg-amber-700 hover:bg-amber-600 text-amber-100"
                >
                  Archer
                </Button>
                <Button 
                  onClick={() => handleRowSelect('diamonds')}
                  className="bg-amber-700 hover:bg-amber-600 text-amber-100"
                >
                  Ballista
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={handlePlaySelectedCard}
              className="bg-amber-700 hover:bg-amber-600 text-amber-100"
            >
              Play Selected Card
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
