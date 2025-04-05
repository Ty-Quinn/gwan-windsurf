
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface AIThinkingProps {
  isVisible: boolean
  onComplete?: () => void
  duration?: number
}

export default function AIThinking({
  isVisible,
  onComplete,
  duration = 1500
}: AIThinkingProps) {
  const [dots, setDots] = useState(0)
  
  useEffect(() => {
    if (!isVisible) return
    
    // Animate the dots
    const dotInterval = setInterval(() => {
      setDots(prev => (prev + 1) % 4)
    }, 300)
    
    // Call onComplete after duration
    const timer = setTimeout(() => {
      if (onComplete) onComplete()
    }, duration)
    
    return () => {
      clearInterval(dotInterval)
      clearTimeout(timer)
    }
  }, [isVisible, duration, onComplete])
  
  if (!isVisible) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-stone-900 border border-amber-800/40 rounded-lg p-6 max-w-md shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 relative">
            <motion.div
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500"
            />
            <motion.div
              animate={{ 
                rotate: [360, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-1 rounded-full border-2 border-transparent border-b-amber-300"
            />
          </div>
          <div className="text-xl text-amber-200 font-medieval">
            AI Opponent Thinking{Array(dots).fill('.').join('')}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
