"use client"

import { cn } from "@/lib/utils"

interface ScoreDisplayProps {
  label: string
  score: number
  roundsWon: number
  highlight: boolean
}

export default function ScoreDisplay({
  label,
  score,
  roundsWon,
  highlight
}: ScoreDisplayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center p-3 rounded-lg transition-all",
        highlight
          ? "bg-amber-900/40 border border-amber-500"
          : "bg-black/30 border border-amber-900/30"
      )}
    >
      <div className="text-sm font-medium text-amber-200 mb-1">{label}</div>
      <div className="text-2xl font-bold text-amber-400">{score}</div>
      <div className="text-xs text-amber-200 mt-1">
        <span className="font-medium">Rounds Won:</span> {roundsWon}
      </div>
    </div>
  )
}
