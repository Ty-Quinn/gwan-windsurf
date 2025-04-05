
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Player } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

interface ScoreDisplayProps {
  player: Player
  isActive: boolean
  playerNumber: number
  skipAnimation?: boolean // Add option to skip animation when switching players
}

export default function ScoreDisplay({ player, isActive, playerNumber, skipAnimation = false }: ScoreDisplayProps) {
  const [prevScore, setPrevScore] = useState(player.score)
  const [scoreChange, setScoreChange] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    // If player view just switched or we're instructed to skip animation, just update score silently
    if (skipAnimation) {
      setPrevScore(player.score)
      return;
    }
    
    // Clear any existing timers when component updates
    let animationTimer: NodeJS.Timeout;
    
    if (player.score !== prevScore) {
      const change = player.score - prevScore
      setScoreChange(change)
      setShowAnimation(true)
      
      // Set a timer to hide the animation after 2 seconds
      animationTimer = setTimeout(() => {
        setShowAnimation(false)
        setPrevScore(player.score)
      }, 2000) // 2 seconds
    }
    
    // Clean up the timer on unmount or before setting a new one
    return () => {
      if (animationTimer) clearTimeout(animationTimer)
    }
  }, [player.score, prevScore, skipAnimation])

  return (
    <div className="relative">
      <div className={cn(
        "flex items-center justify-between p-3 rounded-md transition-all",
        isActive ? "bg-primary/10 border border-primary" : "bg-card"
      )}>
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{player.name}</span>
          <span className="text-sm text-muted-foreground">Player {playerNumber}</span>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">{player.score}</span>
            <Badge variant="outline" className="text-xs">
              {player.roundsWon} rounds won
            </Badge>
          </div>
          
          <AnimatePresence>
            {showAnimation && (
              <motion.div
                initial={{ opacity: 0, y: scoreChange > 0 ? 20 : -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "absolute -right-2 -top-8 px-2 py-1 rounded-md font-bold text-white z-50", // z-50 ensures it's above other elements
                  scoreChange > 0 ? "bg-green-500" : "bg-red-500"
                )}
                style={{ pointerEvents: "none" }} /* Ensures it doesn't block interactions */
              >
                {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
