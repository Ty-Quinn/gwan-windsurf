"use client"

import { useState } from 'react'
import type { Player, Field, Card } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import CardComponent from './card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DecoyRetrievalModalProps {
  player: Player;
  onSelectCard: (row: keyof Field, cardIndex: number) => void;
  onCancel: () => void;
}

export default function DecoyRetrievalModal({
  player,
  onSelectCard,
  onCancel
}: DecoyRetrievalModalProps) {
  const [activeTab, setActiveTab] = useState<keyof Field>("clubs")
  
  // If there are no cards in the player's field, show a message
  const noCardsPlayed = Object.values(player.field).every(row => row.length === 0)
  
  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select a Card to Retrieve</DialogTitle>
          <DialogDescription>
            Select a card from your field to add back to your hand.
          </DialogDescription>
        </DialogHeader>
        
        {noCardsPlayed ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-muted-foreground mb-4">
              No cards played on your field yet.
            </p>
            <Button onClick={onCancel}>Cancel</Button>
          </div>
        ) : (
          <>
            <Tabs defaultValue="clubs" className="w-full" value={activeTab} onValueChange={(value) => setActiveTab(value as keyof Field)}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="clubs" disabled={player.field.clubs.length === 0}>
                  <span className="flex items-center">
                    <span className="text-black dark:text-white">♣</span>
                    <span className="ml-2">Clubs</span>
                    <span className="ml-1 text-xs text-muted-foreground">({player.field.clubs.length})</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="spades" disabled={player.field.spades.length === 0}>
                  <span className="flex items-center">
                    <span className="text-black dark:text-white">♠</span>
                    <span className="ml-2">Spades</span>
                    <span className="ml-1 text-xs text-muted-foreground">({player.field.spades.length})</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="diamonds" disabled={player.field.diamonds.length === 0}>
                  <span className="flex items-center">
                    <span className="text-red-500">♦</span>
                    <span className="ml-2">Diamonds</span>
                    <span className="ml-1 text-xs text-muted-foreground">({player.field.diamonds.length})</span>
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Club cards */}
              <TabsContent value="clubs" className="mt-4">
                {player.field.clubs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No club cards played.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {player.field.clubs.map((card, index) => (
                      <div key={`clubs-${index}`} className="text-center" onClick={() => onSelectCard("clubs", index)}>
                        <CardComponent card={card} hideLabel={true} />
                        <p className="mt-1 text-xs">Click to retrieve</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Spade cards */}
              <TabsContent value="spades" className="mt-4">
                {player.field.spades.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No spade cards played.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {player.field.spades.map((card, index) => (
                      <div key={`spades-${index}`} className="text-center" onClick={() => onSelectCard("spades", index)}>
                        <CardComponent card={card} hideLabel={true} />
                        <p className="mt-1 text-xs">Click to retrieve</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Diamond cards */}
              <TabsContent value="diamonds" className="mt-4">
                {player.field.diamonds.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No diamond cards played.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {player.field.diamonds.map((card, index) => (
                      <div key={`diamonds-${index}`} className="text-center" onClick={() => onSelectCard("diamonds", index)}>
                        <CardComponent card={card} hideLabel={true} />
                        <p className="mt-1 text-xs">Click to retrieve</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={onCancel} className="mr-2">Cancel</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}