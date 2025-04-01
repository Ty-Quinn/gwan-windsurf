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
        return "♣"
      case "spades":
        return "♠"
      case "diamonds":
        return "♦"
      case "hearts":
        return "♥"
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
      default:
        return ""
    }
  }

  const getSuitColor = (suit: string) => {
    switch (suit) {
      case "diamonds":
      case "hearts":
        return "text-red-400"
      default:
        return "text-white"
    }
  }

  const getCardType = () => {
    if (card.isCommander) return { border: "border-yellow-400", text: "text-yellow-400", label: "Commander", value: card.baseValue }
    if (card.isWeather) return { border: "border-red-500", text: "text-red-500", label: getWeatherLabel(), value: 15 }
    if (card.isSpy) return { border: "border-blue-500", text: "text-blue-400", label: "Spy", value: 0 }
    if (card.isMedic) return { border: "border-green-500", text: "text-green-400", label: "Medic", value: 3 }
    if (card.suit === "hearts") return { border: "border-purple-500", text: "text-white", label: "", value: 0 } // Removed "Flexible" text
    return { border: "", text: "text-white", label: "", value: 0 }
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
          "bg-secondary text-white font-semibold rounded-md flex flex-col items-center justify-center w-14 h-16 relative",
          cardType.border && `border-2 ${cardType.border}`,
          cardType.text
        )}
      >
        <div className={`absolute top-0.5 left-0.5 text-xs ${suitColor}`}>{suitSymbol}</div>
        <div className={`text-lg ${cardType.text}`}>{card.value}</div>
        <div className={`text-[8px] ${suitColor} mt-0`}>{suitName}</div>
        <div className={`absolute bottom-0.5 right-0.5 text-xs ${suitColor}`}>{suitSymbol}</div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "transition-transform bg-gradient-to-b from-card to-secondary text-white font-semibold rounded-lg shadow-md flex flex-col items-center justify-center w-28 h-40 cursor-pointer",
        "hover:-translate-y-2",
        selected && "translate-y-[-12px] shadow-xl border-2 border-primary",
        cardType.border && `border-2 ${cardType.border}`,
        disabled && "opacity-60 cursor-not-allowed"
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="w-full flex justify-between items-center p-2">
        <div className={`text-lg ${suitColor}`}>{suitSymbol}</div>
        <div className={`text-lg ${cardType.text}`}>{card.value}</div>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className={`text-4xl ${cardType.text} mb-1`}>{card.value}</div>
        <div className={`text-xs ${suitColor} mb-2 font-medium`}>{suitName}</div>
      </div>
      
      <div className="w-full flex justify-between items-center p-2">
        <div className={`text-lg ${cardType.text}`}>{card.value}</div>
        <div className={`text-lg ${suitColor}`}>{suitSymbol}</div>
      </div>
      
      {cardType.label && (
        <div className="absolute bottom-0 left-0 right-0 text-center text-xs py-1 bg-black/60">
          <span className={cardType.text}>{cardType.label}</span>
          {cardType.value > 0 && <span> ({cardType.value})</span>}
        </div>
      )}
    </div>
  )
}
