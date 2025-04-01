"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface GameRulesModalProps {
  onClose: () => void
}

export default function GameRulesModal({
  onClose,
}: GameRulesModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">GWAN Game Rules</h3>
          <Button 
            onClick={onClose} 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-primary">Game Overview</h4>
            <p>GWAN is a strategic card game where players compete to score the highest total value across their side of the board. Players take turns playing cards or passing, with each card providing both value and potential special abilities.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-primary">Game Structure</h4>
            <ul className="list-disc list-inside ml-4">
              <li>1 game = Best 2 of 3 rounds</li>
              <li>Each round ends when both players pass or run out of cards</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-primary">Setup</h4>
            <ul className="list-disc list-inside ml-4">
              <li>Each player is dealt 10 cards from the standard deck</li>
              <li>Players roll to determine who goes first in round 1</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-primary">Gameplay Basics</h4>
            <p className="font-medium">Objective:</p>
            <p className="ml-4 mb-2">Score the highest total value on your side of the field by strategically placing cards and using their special abilities.</p>
            
            <p className="font-medium">On Your Turn:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Play one card to the appropriate row OR pass your turn</li>
              <li>Once you pass, you cannot play more cards that round</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-primary">Card Placement</h4>
            <p>Cards are placed in rows according to their suit:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Clubs (Close Combat row): +2 row bonus when no weather effects</li>
              <li>Spades (Mid Range row): +3 row bonus when no weather effects</li>
              <li>Diamonds (Long Range row): +5 row bonus when no weather effects</li>
              <li>Hearts (Flexible): Can be played in either Close or Mid Range rows</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-primary">Scoring</h4>
            <ul className="list-disc list-inside ml-4">
              <li>Each card contributes its base value to your score</li>
              <li>Each row with at least one card gets its row bonus (if no weather effect)</li>
              <li>Your total score is the sum of all cards plus row bonuses</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-primary">Special Card Types</h4>
            
            <div className="ml-4 mb-2">
              <h5 className="font-semibold text-yellow-400">Commander Cards (Face Cards)</h5>
              <ul className="list-disc list-inside ml-4">
                <li>Jacks (11), Queens (12), Kings (13)</li>
                <li>Maintain their full value even under weather effects</li>
              </ul>
            </div>
            
            <div className="ml-4 mb-2">
              <h5 className="font-semibold text-red-500">Weather Cards (Aces)</h5>
              <ul className="list-disc list-inside ml-4">
                <li>Affect both players and last until cleared</li>
                <li>Ace of Clubs (Tundra): Nullifies Close Combat row bonus; reduces non-Commander cards to value 1</li>
                <li>Ace of Spades (Rain): Nullifies Mid Range row bonus; reduces non-Commander cards to value 1</li>
                <li>Ace of Diamonds (Fog): Nullifies Long Range row bonus; reduces non-Commander cards to value 1</li>
                <li>Ace of Hearts (Clear Skies): Clears weather effect from one row of your choice</li>
              </ul>
            </div>
            
            <div className="ml-4 mb-2">
              <h5 className="font-semibold text-blue-400">Spy Cards (5s)</h5>
              <ul className="list-disc list-inside ml-4">
                <li>Played to your opponent's matching row</li>
                <li>Let you draw 2 new cards from the deck</li>
                <li>Add their value to your opponent's score (strategic sacrifice)</li>
              </ul>
            </div>
            
            <div className="ml-4">
              <h5 className="font-semibold text-green-400">Medic Cards (3s)</h5>
              <ul className="list-disc list-inside ml-4">
                <li>No special abilities in the simplified version, just played for their value</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-primary">Rounds and Victory</h4>
            <ul className="list-disc list-inside ml-4">
              <li>The player with the highest total score when both players pass wins the round</li>
              <li>First player to win 2 rounds wins the game</li>
              <li>For subsequent rounds, the loser of the previous round goes first</li>
              <li>In subsequent rounds, each player draws 7 new cards</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-primary">Strategy Tips</h4>
            <ul className="list-disc list-inside ml-4">
              <li>Weather timing: Play weather cards to weaken rows where your opponent is strong</li>
              <li>Commanders: Save commander cards for rows affected by weather since they keep their value</li>
              <li>Row distribution: Try to spread your cards to benefit from multiple row bonuses</li>
              <li>Spy cards: Use these strategically - they help your opponent's score but let you draw more cards</li>
              <li>Passing: Knowing when to pass is key - sometimes letting your opponent play more cards while you conserve yours for later rounds is beneficial</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <Button 
            onClick={onClose}
            className="w-full"
          >
            Got It
          </Button>
        </div>
      </div>
    </div>
  )
}
