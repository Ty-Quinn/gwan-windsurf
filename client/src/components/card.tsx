"use client"

import { Card } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CardComponentProps {
  card: Card
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  compact?: boolean
}

export default function CardComponent({
  card,
  selected = false,
  onClick,
  disabled = false,
  compact = false,
}: CardComponentProps) {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case "clubs":
        return "⚔️" // Infantry symbol - sword
      case "spades":
        return "🏹" // Archer symbol - bow and arrow
      case "diamonds":
        return "💣" // Ballista symbol - bomb (U+1F4A3)
      case "hearts":
        return "⚜️" // Mercenary symbol - fleur-de-lis
      case "joker":
        return "⭐" // Joker symbol - star
      default:
        return ""
    }
  }
  
  const getSuitName = (suit: string) => {
    switch (suit) {
      case "clubs":
        return "Infantry"
      case "spades":
        return "Archer"
      case "diamonds":
        return "Ballista"
      case "hearts":
        return "Mercenary"
      case "joker":
        return "Joker"
      default:
        return ""
    }
  }

  const getSuitColor = (suit: string) => {
    switch (suit) {
      case "clubs": // Infantry
        return "text-stone-300"
      case "spades": // Archer
        return "text-emerald-300"
      case "diamonds": // Ballista
        return "text-amber-300"
      case "hearts": // Mercenary
        return "text-rose-300"
      case "joker":
        return "text-purple-300"
      default:
        return "text-amber-100"
    }
  }

  const getCardType = () => {
    if (card.isCommander) return { 
      border: "border-yellow-500", 
      text: "text-yellow-400", 
      label: "Commander", 
      value: card.baseValue,
      bg: "bg-gradient-to-b from-amber-800/95 to-amber-900/95" 
    }
    if (card.isWeather) return { 
      border: "border-sky-500", 
      text: "text-sky-400", 
      label: getWeatherLabel(), 
      value: 15,
      bg: "bg-gradient-to-b from-sky-800/95 to-sky-900/95" 
    }
    if (card.isJoker) return { 
      border: "border-purple-500", 
      text: "text-purple-400", 
      label: "Joker (spy)", 
      value: 1,
      bg: "bg-gradient-to-b from-purple-800/95 to-purple-900/95" 
    }
    if (card.isSpy && !card.isJoker) return { 
      border: "border-blue-500", 
      text: "text-blue-400", 
      label: "Spy", 
      value: 0,
      bg: "bg-gradient-to-b from-blue-800/95 to-blue-900/95" 
    }
    if (card.isDecoy) return { 
      border: "border-orange-500", 
      text: "text-orange-400", 
      label: "Decoy", 
      value: 0,
      bg: "bg-gradient-to-b from-orange-800/95 to-orange-900/95" 
    }
    if (card.isMedic) return { 
      border: "border-green-500", 
      text: "text-green-400", 
      label: "Medic", 
      value: 3,
      bg: "bg-gradient-to-b from-green-800/95 to-green-900/95" 
    }
    if (card.isRogue) return { 
      border: "border-amber-500", 
      text: "text-amber-400", 
      label: "Rogue", 
      value: card.diceValue || "?",
      bg: "bg-gradient-to-b from-amber-800/95 to-amber-900/95" 
    }
    if (card.isSniper) return { 
      border: "border-indigo-500", 
      text: "text-indigo-400", 
      label: "Sniper", 
      value: 2,
      bg: "bg-gradient-to-b from-indigo-800/95 to-indigo-900/95" 
    }
    if (card.suit === "hearts") return { 
      border: "border-rose-500", 
      text: "text-rose-400", 
      label: "", 
      value: 0,
      bg: "bg-gradient-to-b from-rose-800/95 to-rose-900/95" 
    }
    return { 
      border: "", 
      text: "text-amber-100", 
      label: "", 
      value: 0,
      bg: "bg-gradient-to-b from-amber-700/90 to-amber-900/90" 
    }
  }

  const getWeatherLabel = () => {
    if (card.suit === "clubs") return "Tundra"
    if (card.suit === "spades") return "Rain"
    if (card.suit === "diamonds") return "Fog"
    if (card.suit === "hearts") return "Clear"
    return ""
  }
  
  // Weather labels for compact card view
  const getWeatherTypeLabel = (suit: string): string => {
    switch (suit) {
      case "clubs": return "Tundra"
      case "spades": return "Rain"
      case "diamonds": return "Fog"
      case "hearts": return "Clear"
      default: return ""
    }
  }

  const cardType = getCardType()
  const suitSymbol = getSuitSymbol(card.suit)
  const suitName = getSuitName(card.suit)
  const suitColor = getSuitColor(card.suit)

  // For compact mode, used in the game board display
  if (compact) {
    return (
      <div 
        className={cn(
          "card text-foreground font-serif rounded-md flex flex-col items-center justify-center w-14 h-16 relative",
          cardType.bg || "bg-gradient-to-b from-card to-secondary",
          cardType.border && `border ${cardType.border}`,
          selected && "ring-2 ring-amber-500",
          onClick && !disabled ? "cursor-pointer hover:opacity-80" : "",
          disabled && "opacity-60 cursor-not-allowed"
        )}
        onClick={!disabled ? onClick : undefined}
      >
        <div className={`absolute top-0.5 left-0.5 text-xs ${suitColor}`}>{suitSymbol}</div>
        <div className={`text-base ${cardType.text}`}>{card.value}</div>
        <div className={`text-[8px] ${suitColor} mt-0`}>{suitName}</div>
        <div className={`absolute bottom-0.5 right-0.5 text-xs ${suitColor}`}>{suitSymbol}</div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "card font-serif rounded-lg flex flex-col items-center justify-center w-28 h-40 cursor-pointer",
        cardType.bg || "bg-gradient-to-b from-card to-secondary",
        "hover:-translate-y-2 hover:rotate-1 mt-3", 
        selected && "selected-card",
        cardType.border && `border ${cardType.border}`,
        disabled && "opacity-60 cursor-not-allowed"
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="w-full flex justify-between items-center p-2">
        <div className={`text-base ${suitColor}`}>{suitSymbol}</div>
        <div className={`text-base ${cardType.text} font-medieval`}>{card.value}</div>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center relative">
        {/* Card value with medieval styling */}
        <div className={`text-4xl ${cardType.text} mb-1 font-medieval`}>{card.value}</div>
        
        {/* Ornamental divider */}
        <div className="w-16 h-0.5 bg-amber-700/40 rounded mb-1.5"></div>
        
        {/* Suit name */}
        <div className={`text-xs ${suitColor} mb-2 font-medium`}>{suitName}</div>
        
        {/* Decorative element */}
        <div className="absolute w-full h-full flex items-center justify-center opacity-5 pointer-events-none">
          <div className={`text-6xl ${suitColor}`}>{suitSymbol}</div>
        </div>
      </div>
      
      <div className="w-full flex justify-between items-center p-2">
        <div className={`text-base ${cardType.text} font-medieval`}>{card.value}</div>
        <div className={`text-base ${suitColor}`}>{suitSymbol}</div>
      </div>
      
      {cardType.label && (
        <div className="absolute bottom-0 left-0 right-0 text-center text-xs py-1 bg-stone-950/70 font-medieval">
          <span className={cardType.text}>{cardType.label}</span>
          {cardType.value !== 0 && cardType.value !== "?" && <span> ({cardType.value})</span>}
        </div>
      )}
    </div>
  )
}
