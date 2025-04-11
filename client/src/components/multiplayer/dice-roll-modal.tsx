"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"

interface DiceRollModalProps {
  open: boolean
  onDiceRollComplete: (firstPlayerIndex: number) => Promise<void>
}

export default function DiceRollModal({ 
  open, 
  onDiceRollComplete 
}: DiceRollModalProps) {
  const [rolling, setRolling] = useState(false)
  const [diceValues, setDiceValues] = useState<[number, number]>([1, 1])
  const [winner, setWinner] = useState<number | null>(null)
  
  const rollDice = () => {
    setRolling(true)
    
    // Simulate rolling animation
    const rollInterval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ])
    }, 100)
    
    // Stop rolling after 2 seconds
    setTimeout(() => {
      clearInterval(rollInterval)
      
      // Generate final values
      const finalValues: [number, number] = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]
      
      setDiceValues(finalValues)
      setRolling(false)
      
      // Determine winner
      if (finalValues[0] > finalValues[1]) {
        setWinner(0) // Player 1 wins
      } else if (finalValues[1] > finalValues[0]) {
        setWinner(1) // Player 2 wins
      } else {
        // Tie - roll again after a delay
        setTimeout(() => rollDice(), 1500)
      }
    }, 2000)
  }
  
  // Auto-roll when modal opens
  useEffect(() => {
    if (open && !rolling && winner === null) {
      rollDice()
    }
  }, [open])
  
  // Handle completion
  useEffect(() => {
    if (winner !== null) {
      const timer = setTimeout(() => {
        onDiceRollComplete(winner)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [winner, onDiceRollComplete])
  
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-[#2a1a14] border-amber-800 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-2xl text-center">
            Rolling for First Turn
          </DialogTitle>
          <DialogDescription className="text-amber-200 text-center">
            {winner === null
              ? "Highest roll goes first..."
              : winner === 0
                ? "You go first!"
                : "Opponent goes first!"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-8 flex justify-center space-x-12">
          <DiceDisplay 
            value={diceValues[0]} 
            label="You" 
            rolling={rolling}
            highlight={winner === 0}
          />
          
          <DiceDisplay 
            value={diceValues[1]} 
            label="Opponent" 
            rolling={rolling}
            highlight={winner === 1}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface DiceDisplayProps {
  value: number
  label: string
  rolling: boolean
  highlight: boolean
}

function DiceDisplay({ value, label, rolling, highlight }: DiceDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-amber-300 mb-2">{label}</span>
      <motion.div
        className={`w-16 h-16 bg-amber-800 rounded-lg flex items-center justify-center text-2xl font-bold ${
          highlight ? "ring-2 ring-amber-400" : ""
        }`}
        animate={rolling ? { rotate: 360, scale: [1, 1.2, 1] } : {}}
        transition={rolling ? { repeat: Infinity, duration: 0.5 } : {}}
      >
        {value}
      </motion.div>
    </div>
  )
}
