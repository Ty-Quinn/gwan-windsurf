"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

// Generic DiceRoller component that can handle any type of dice
interface DiceRollerProps {
  sides?: number;
  count?: number;
  onRollComplete?: (results: number[], total: number) => void;
  autoRoll?: boolean;
  label?: string;
  disabled?: boolean;
}

const DiceRoller = ({ 
  sides = 6, 
  count = 1, 
  onRollComplete, 
  autoRoll = false, 
  label = `D${sides}`,
  disabled = false 
}: DiceRollerProps) => {
  const [rolling, setRolling] = useState(false)
  // Initialize with random values instead of all 1s and calculate total value
  const [results, setResults] = useState(() => {
    const initialDice = Array(count).fill(0).map(() => Math.floor(Math.random() * sides) + 1);
    return initialDice;
  });
  
  // Initialize totalValue from the same random dice values
  const [totalValue, setTotalValue] = useState(() => 
    results.reduce((sum, val) => sum + val, 0)
  )

  // Handle auto-roll on mount
  useEffect(() => {
    if (autoRoll) {
      rollDice()
    }
  }, [autoRoll])

  const rollDice = () => {
    setRolling(true)

    // Generate random values immediately instead of showing all 1s
    const generateRandomDice = () => {
      return Array(count)
        .fill(0)
        .map(() => Math.floor(Math.random() * sides) + 1);
    };

    // Set initial random dice values immediately
    const initialResults = generateRandomDice();
    setResults(initialResults);
    setTotalValue(initialResults.reduce((sum, val) => sum + val, 0));

    // Simulate dice rolls with animation
    let rollCount = 0
    const maxRolls = 10 // Number of visual "rolls" before settling
    const interval = setInterval(() => {
      // Generate random dice values
      const newResults = generateRandomDice();
      setResults(newResults)
      setTotalValue(newResults.reduce((sum, val) => sum + val, 0))

      rollCount++
      if (rollCount >= maxRolls) {
        clearInterval(interval)
        setRolling(false)
        
        // Generate final results
        const finalResults = generateRandomDice();
        setResults(finalResults);
        const finalTotal = finalResults.reduce((sum, val) => sum + val, 0);
        setTotalValue(finalTotal);
        
        if (onRollComplete) {
          onRollComplete(finalResults, finalTotal);
        }
      }
    }, 100)
  }

  // Render a visual representation of a die
  const renderDie = (value: number, index: number) => {
    // For D6, render pips like a real die
    if (sides === 6) {
      return (
        <div
          key={`die-${index}`}
          className={`w-12 h-12 bg-white rounded-lg shadow-lg relative m-2 ${rolling ? "animate-bounce" : ""}`}
        >
          {/* Render pips based on value */}
          {value === 1 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
          )}

          {value === 2 && (
            <div className="absolute inset-0">
              <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-black rounded-full"></div>
            </div>
          )}

          {value === 3 && (
            <div className="absolute inset-0">
              <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-black rounded-full"></div>
            </div>
          )}

          {value === 4 && (
            <div className="absolute inset-0">
              <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-black rounded-full"></div>
            </div>
          )}

          {value === 5 && (
            <div className="absolute inset-0">
              <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </div>
              <div className="absolute bottom-2 left-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-black rounded-full"></div>
            </div>
          )}

          {value === 6 && (
            <div className="absolute inset-0">
              <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute top-1/2 transform -translate-y-1/2 left-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute top-1/2 transform -translate-y-1/2 right-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-black rounded-full"></div>
            </div>
          )}
        </div>
      )
    }

    // For other dice (D10, D20), render number
    return (
      <div
        key={`die-${index}`}
        className={`w-12 h-12 bg-white rounded-lg shadow-lg relative m-2 flex items-center justify-center ${rolling ? "animate-bounce" : ""}`}
      >
        <span className="text-black font-bold">{value}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-2">
      <div className="flex flex-wrap justify-center mb-2">{results.map((value, index) => renderDie(value, index))}</div>

      {count > 1 && (
        <div className="text-center mb-2">
          <span className="font-bold">Total: {totalValue}</span>
        </div>
      )}

      <Button onClick={rollDice} disabled={rolling || disabled} className="w-full">
        {rolling ? "Rolling..." : `Roll ${count}${label}`}
      </Button>
    </div>
  )
}

export default DiceRoller