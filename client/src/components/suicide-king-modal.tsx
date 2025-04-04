"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "../lib/types"
import CardComponent from "./card"
import { Shield, Sparkles } from "lucide-react"

interface SuicideKingModalProps {
  open: boolean
  card: Card | null
  onClearWeather: () => void
  onSelectSecondBlight: () => void
  onCancel: () => void
}

export default function SuicideKingModal({ 
  open, 
  card, 
  onClearWeather, 
  onSelectSecondBlight, 
  onCancel 
}: SuicideKingModalProps) {

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-medieval">The Suicide King's Sacrifice</DialogTitle>
          <DialogDescription className="text-center">
            The King of Hearts - the Suicide King - offers two powerful abilities at the cost of removing himself from the game entirely.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center my-4">
          {card && <CardComponent card={card} compact={false} />}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Button 
            variant="ghost"
            className="flex flex-col items-center p-4 border border-amber-700 rounded-lg bg-amber-950/40 hover:bg-amber-900/30 transition-colors w-full h-full"
            onClick={() => {
              console.log("Clear Weather option clicked");
              onClearWeather();
            }}
          >
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 text-sky-400 mb-2" />
              <h3 className="text-lg font-medium mb-2 text-sky-400">Clear All Weather</h3>
              <p className="text-sm text-center">
                Remove all weather effects from the entire board, restoring all rows to their full power.
              </p>
            </div>
          </Button>
          
          <Button 
            variant="ghost"
            className="flex flex-col items-center p-4 border border-amber-700 rounded-lg bg-amber-950/40 hover:bg-amber-900/30 transition-colors w-full h-full"
            onClick={() => {
              console.log("Second Blight option clicked");
              onSelectSecondBlight();
            }}
          >
            <div className="flex flex-col items-center">
              <Sparkles className="h-8 w-8 text-purple-400 mb-2" />
              <h3 className="text-lg font-medium mb-2 text-purple-400">Second Blight</h3>
              <p className="text-sm text-center">
                Select an additional Blight card to add to your arsenal. If you've already used your first Blight card, this will allow you to use another one.
              </p>
            </div>
          </Button>
        </div>
        
        <div className="mt-2 text-center italic text-amber-200/60">
          Remember: The Suicide King will be removed from play entirely, not added to your discard pile.
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between mt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}