"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GameRulesModalProps {
  open: boolean
  onClose: () => void
}

export default function GameRulesModal({ open, onClose }: GameRulesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] bg-[#2a1a14] border-amber-800 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-2xl">
            GWAN - Game Rules
          </DialogTitle>
          <DialogDescription className="text-amber-200">
            A strategic card game of battlefield dominance
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-amber-300 mb-2">Overview</h3>
              <p className="text-amber-100">
                GWAN is a two-player card game where players take turns playing cards to their battlefield to gain points. 
                The player with the highest score at the end of a round wins that round. 
                Win two out of three rounds to win the game.
              </p>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold text-amber-300 mb-2">Card Types</h3>
              <ul className="list-disc pl-5 space-y-2 text-amber-100">
                <li><span className="font-semibold">Infantry (Clubs)</span> - Close combat units that can only be played on the Infantry row.</li>
                <li><span className="font-semibold">Archers (Spades)</span> - Ranged units that can only be played on the Archer row.</li>
                <li><span className="font-semibold">Ballista (Diamonds)</span> - Siege units that can only be played on the Ballista row.</li>
                <li><span className="font-semibold">Special (Hearts)</span> - Special cards that can be played on any row.</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold text-amber-300 mb-2">Game Flow</h3>
              <ol className="list-decimal pl-5 space-y-2 text-amber-100">
                <li>Players take turns playing one card at a time or passing.</li>
                <li>Cards are played to the corresponding row on your side of the battlefield.</li>
                <li>Each card contributes its value to your total score.</li>
                <li>Special cards may have abilities that affect the game state.</li>
                <li>Weather effects may disable certain rows.</li>
                <li>The round ends when both players pass consecutively.</li>
                <li>The player with the highest total score wins the round.</li>
                <li>Win two out of three rounds to win the game.</li>
              </ol>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold text-amber-300 mb-2">Special Abilities</h3>
              <ul className="list-disc pl-5 space-y-2 text-amber-100">
                <li><span className="font-semibold">Medic</span> - Allows you to revive a card from the discard pile.</li>
                <li><span className="font-semibold">Spy</span> - Lets you draw additional cards.</li>
                <li><span className="font-semibold">Decoy</span> - Swap with a card on the battlefield.</li>
                <li><span className="font-semibold">Weather</span> - Affects specific rows, reducing card values to 1.</li>
                <li><span className="font-semibold">Clear Weather</span> - Removes all weather effects.</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold text-amber-300 mb-2">Multiplayer Rules</h3>
              <ul className="list-disc pl-5 space-y-2 text-amber-100">
                <li>Players roll dice to determine who goes first.</li>
                <li>All game actions are synchronized between players.</li>
                <li>If a player disconnects, they have 30 seconds to reconnect before forfeiting.</li>
                <li>Chat functionality allows communication between players.</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold text-amber-300 mb-2">Strategy Tips</h3>
              <ul className="list-disc pl-5 space-y-2 text-amber-100">
                <li>Don't play all your strong cards in the first round.</li>
                <li>Sometimes it's better to lose a round to save cards for later rounds.</li>
                <li>Pay attention to your opponent's play style and adapt accordingly.</li>
                <li>Weather cards can drastically change the outcome of a round.</li>
                <li>Special ability cards are often more valuable than their point value suggests.</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button 
            className="bg-amber-700 hover:bg-amber-600 text-amber-100"
            onClick={onClose}
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
