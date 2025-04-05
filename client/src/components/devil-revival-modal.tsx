'use client'

import { useState } from 'react'
import type { Card, Player } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import CardComponent from './card'

interface DevilRevivalModalProps {
  players: Player[]
  playerView: number
  onSelectCard: (playerIndex: number, cardIndex: number) => void
  onCancel: () => void
}

export default function DevilRevivalModal({
  players,
  playerView,
  onSelectCard,
  onCancel
}: DevilRevivalModalProps) {
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(playerView)
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)

  const opponentIndex = 1 - playerView

  const handleConfirm = () => {
    if (selectedCardIndex !== null) {
      onSelectCard(selectedPlayerIndex, selectedCardIndex)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <span className="text-3xl">😈</span>
            The Devil - Revive Card
          </DialogTitle>
          <DialogDescription>
            Select a card from either player's discard pile to revive and add to your field.
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          defaultValue={String(playerView)} 
          onValueChange={(val) => {
            setSelectedPlayerIndex(Number(val))
            setSelectedCardIndex(null)
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={String(playerView)}>Your Discard Pile</TabsTrigger>
            <TabsTrigger value={String(opponentIndex)}>Opponent's Discard Pile</TabsTrigger>
          </TabsList>
          
          {[playerView, opponentIndex].map((pIndex) => (
            <TabsContent key={pIndex} value={String(pIndex)}>
              <ScrollArea className="h-[350px]">
                {players[pIndex].discardPile.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                    {players[pIndex].discardPile.map((card, index) => (
                      <div key={index} className="flex justify-center">
                        <CardComponent
                          card={card}
                          selected={selectedPlayerIndex === pIndex && selectedCardIndex === index}
                          onClick={() => {
                            setSelectedPlayerIndex(pIndex)
                            setSelectedCardIndex(index)
                          }}
                          hideLabel={true}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">No cards in discard pile</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter className="flex justify-between mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedCardIndex === null}
          >
            Revive Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}