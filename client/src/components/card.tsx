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
    if (card.isCommander) return { border: "border-yellow-400", text: "text-yellow-400", label: `Commander (${card.baseValue})` }
    if (card.isWeather) return { border: "border-red-500", text: "text-red-500", label: getWeatherLabel() }
    if (card.isSpy) return { border: "border-blue-500", text: "text-blue-400", label: "Spy (Draw 2)" }
    if (card.isMedic) return { border: "border-green-500", text: "text-green-400", label: "Medic (3)" }
    if (card.suit === "hearts") return { border: "border-purple-500", text: "text-white", label: "Flexible" }
    return { border: "", text: "text-white", label: "" }
  }

  const getWeatherLabel = () => {
    if (card.suit === "clubs") return "Weather: Tundra (15)"
    if (card.suit === "spades") return "Weather: Rain (15)"
    if (card.suit === "diamonds") return "Weather: Fog (15)"
    if (card.suit === "hearts") return "Clear Weather (15)"
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

  if (compact) {
    return (
      <div 
        className={cn(
          "bg-secondary text-white font-semibold rounded-md flex flex-col items-center justify-center w-14 h-20 relative",
          cardType.border && `border-2 ${cardType.border}`,
          cardType.text
        )}
      >
        <div className={`absolute top-1 left-1 text-xs ${suitColor}`}>{suitSymbol}</div>
        <div className={`text-xl ${cardType.text}`}>{card.value}</div>
        <div className={`text-[10px] mt-0.5 ${suitColor}`}>{suitName}</div>
        <div className={`absolute bottom-1 right-1 text-xs ${suitColor}`}>{suitSymbol}</div>
        
        {/* Show simplified mini-indicator for special card types */}
        {cardType.label && (
          <div className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-black/50 py-0.5 rounded-b overflow-hidden text-ellipsis whitespace-nowrap">
            {card.isCommander ? "Commander" : 
             card.isWeather ? getWeatherTypeLabel(card.suit) : 
             card.isSpy ? "Spy" : 
             card.isMedic ? "Medic" : 
             card.suit === "hearts" ? "Flexible" : ""}
          </div>
        )}
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
        <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-white">
          {cardType.label}
        </div>
      )}
    </div>
  )
}
