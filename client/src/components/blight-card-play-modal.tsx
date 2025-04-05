'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { BlightCard, Player } from '@/lib/types'

interface BlightCardPlayModalProps {
  open: boolean
  player: Player
  onPlayBlightCard: (cardIndex: number) => void
  onCancel: () => void
}

export default function BlightCardPlayModal({
  open,
  player,
  onPlayBlightCard,
  onCancel
}: BlightCardPlayModalProps) {
  if (player.blightCards.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Play Blight Card</DialogTitle>
          <DialogDescription>
            You can play a Blight card once per match at the beginning of your turn.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {player.blightCards
            .filter(card => !card.used)
            .map((blightCard, index) => {
              // Find the actual index in the original array, not the filtered array
              const originalIndex = player.blightCards.findIndex(card => card.id === blightCard.id);
              
              return (
                <Card 
                  key={blightCard.id} 
                  className="bg-card/50 shadow-md hover:shadow-lg cursor-pointer transform transition-transform hover:scale-[1.01]" 
                  onClick={() => onPlayBlightCard(originalIndex)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">{blightCard.name}</CardTitle>
                      <span className="text-3xl">{blightCard.icon}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {blightCard.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="ghost" size="sm" className="w-full" onClick={(e) => {
                      e.stopPropagation();
                      onPlayBlightCard(originalIndex);
                    }}>
                      Select
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
        </div>

        <p className="text-sm text-muted-foreground italic">
          Note: You can only use one Blight card per turn. Each Blight card can only be used once per match.
        </p>

        <DialogFooter className="flex justify-between mt-4">
          <Button variant="outline" onClick={onCancel}>
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}