'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { BlightCard, Player } from '@/lib/types'

interface BlightCardPlayModalProps {
  open: boolean
  player: Player
  onPlayBlightCard: () => void
  onCancel: () => void
}

export default function BlightCardPlayModal({
  open,
  player,
  onPlayBlightCard,
  onCancel
}: BlightCardPlayModalProps) {
  if (!player.blightCard) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Play Blight Card</DialogTitle>
          <DialogDescription>
            You can play your Blight card once per match at the beginning of your turn.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Card className="bg-card/50 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">{player.blightCard.name}</CardTitle>
                <span className="text-3xl">{player.blightCard.icon}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {player.blightCard.description}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <p className="text-sm text-muted-foreground italic">
          Note: Once played, your Blight card cannot be used again in this match.
        </p>

        <DialogFooter className="flex justify-between mt-4">
          <Button variant="outline" onClick={onCancel}>
            Not now
          </Button>
          <Button onClick={onPlayBlightCard}>
            Play Blight Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}