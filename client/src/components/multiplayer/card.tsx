"use client"

import { Card as CardType } from "@/lib/types"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface CardComponentProps {
  card: CardType
  isSelected?: boolean
  small?: boolean
  onClick?: () => void
}

export default function CardComponent({
  card,
  isSelected = false,
  small = false,
  onClick
}: CardComponentProps) {
  // Get suit symbol and color
  const getSuitInfo = (suit: string) => {
    switch (suit) {
      case "hearts":
        return { symbol: "♥", color: "text-red-500" }
      case "diamonds":
        return { symbol: "♦", color: "text-red-500" }
      case "clubs":
        return { symbol: "♣", color: "text-slate-800" }
      case "spades":
        return { symbol: "♠", color: "text-slate-800" }
      default:
        return { symbol: "?", color: "text-gray-500" }
    }
  }

  // Get card value display
  const getValueDisplay = (value: string) => {
    // If value is already a string like "A", "J", "Q", "K", return it
    if (typeof value === 'string' && isNaN(parseInt(value))) {
      return value;
    }
    
    // Otherwise, convert numeric string to appropriate display
    const numValue = parseInt(value);
    switch (numValue) {
      case 1:
        return "A"
      case 11:
        return "J"
      case 12:
        return "Q"
      case 13:
        return "K"
      default:
        return value
    }
  }

  const { symbol, color } = getSuitInfo(card.suit)
  const valueDisplay = getValueDisplay(card.value)

  return (
    <motion.div
      className={cn(
        "relative rounded-lg overflow-hidden cursor-pointer transition-all",
        small ? "w-12 h-16" : "w-20 h-28",
        isSelected ? "ring-4 ring-amber-400" : ""
      )}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-white rounded-lg flex flex-col items-center justify-center">
        <div className={cn("font-bold", color, small ? "text-sm" : "text-xl")}>
          {valueDisplay}
        </div>
        <div className={cn(color, small ? "text-lg" : "text-3xl")}>
          {symbol}
        </div>
        
        {(card.isMedic || card.isSpy || card.isDecoy || card.isWeather || card.isCommander) && (
          <div className="absolute bottom-1 left-1 right-1 text-center bg-amber-100 rounded-sm text-amber-900 text-xs px-1">
            {small ? "★" : (
              card.isMedic ? "Medic" : 
              card.isSpy ? "Spy" : 
              card.isDecoy ? "Decoy" : 
              card.isWeather ? "Weather" : 
              card.isCommander ? "Commander" : ""
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
