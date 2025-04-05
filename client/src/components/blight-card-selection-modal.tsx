'use client'

import { useState } from 'react'
import { BlightCard, BlightEffect } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const BLIGHT_CARDS: BlightCard[] = [
  {
    id: 'the-fool',
    name: 'The Fool',
    description: 'Converts opponent\'s Commander card to your side. If multiple commanders are on the opponent\'s field, the highest value commander is converted.',
    effect: BlightEffect.FOOL,
    used: false,
    icon: '🃏'
  },
  {
    id: 'the-magician',
    name: 'The Magician',
    description: 'Roll 1D20 vs. total value of opponent\'s row of choice. If roll exceeds the combined value of all cards in that row (without row bonus), all cards in that row are discarded.',
    effect: BlightEffect.MAGICIAN,
    used: false,
    icon: '🔮'
  },
  {
    id: 'the-lovers',
    name: 'The Lovers',
    description: 'Doubles the value of target card (cannot target Commanders).',
    effect: BlightEffect.LOVERS,
    used: false,
    icon: '❤️'
  },
  {
    id: 'death',
    name: 'Death',
    description: 'Discard your hand and draw an equal number of new cards.',
    effect: BlightEffect.DEATH,
    used: false,
    icon: '💀'
  },
  {
    id: 'wheel-of-fortune',
    name: 'Wheel of Fortune',
    description: 'Roll 1D10 and add result to your total score.',
    effect: BlightEffect.WHEEL,
    used: false,
    icon: '🎡'
  },
  {
    id: 'hanged-man',
    name: 'Hanged Man',
    description: 'Destroys a spy card on opponent\'s field.',
    effect: BlightEffect.HANGED_MAN,
    used: false,
    icon: '🧍‍♂️'
  },
  {
    id: 'the-emperor',
    name: 'The Emperor',
    description: 'Returns one of your spy cards from opponent\'s field to your hand.',
    effect: BlightEffect.EMPEROR,
    used: false,
    icon: '👑'
  },
  {
    id: 'the-devil',
    name: 'The Devil',
    description: 'Roll 3D6; if you roll a total of three 6\'s over the course of 6 rolls then you revive one card from either player\'s discard pile to your own field.',
    effect: BlightEffect.DEVIL,
    used: false,
    icon: '😈'
  }
]

interface BlightCardSelectionModalProps {
  open: boolean
  playerIndex: number
  onSelectCard: (playerIndex: number, card: BlightCard) => void
  onClose: () => void
  excludedCardIds?: string[]
  isSecondSelection?: boolean
}

export default function BlightCardSelectionModal({ 
  open,
  playerIndex,
  onSelectCard,
  onClose,
  excludedCardIds = [],
  isSecondSelection = false
}: BlightCardSelectionModalProps) {
  const [selectedCard, setSelectedCard] = useState<BlightCard | null>(null)

  const handleConfirm = () => {
    if (selectedCard) {
      onSelectCard(playerIndex, selectedCard)
      setSelectedCard(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isSecondSelection 
              ? `${playerIndex === 0 ? "Player 1" : "Player 2"} - Choose Your Second Blight Card`
              : `${playerIndex === 0 ? "Player 1" : "Player 2"} - Choose Your Blight Card`}
          </DialogTitle>
          <DialogDescription>
            {isSecondSelection 
              ? "Thanks to the Suicide King's powerful magic, you may select a second Blight card. This is in addition to any Blight card you already have. Your turn will end after making this selection."
              : playerIndex === 0 
                ? "You're first to choose! Each player secretly selects one Blight card for the entire match. After you select, Player 2 will choose theirs." 
                : "Player 1 has made their selection. Now it's your turn to choose your Blight card for the match."}
            <br/><br/>
            {isSecondSelection 
              ? "This second Blight card follows the same rules - it can be used once at the beginning of your turn before playing a regular card. The Suicide King card will be removed from play entirely." 
              : "Blight cards can be used once at the beginning of your turn before playing a regular card. Choose wisely!"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
            {BLIGHT_CARDS.filter(card => !excludedCardIds.includes(card.id)).map((card) => (
              <Card 
                key={card.id}
                className={`cursor-pointer transition-all ${
                  selectedCard?.id === card.id 
                    ? 'ring-2 ring-primary shadow-lg scale-[1.02] bg-primary/5' 
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedCard(card)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{card.name}</CardTitle>
                    <span className="text-3xl">{card.icon}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm min-h-20">
                    {card.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedCard(card)
                      // When clicking Select button, immediately select the card
                      onSelectCard(playerIndex, card)
                    }}
                  >
                    Select
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Player {playerIndex + 1}'s selection
          </div>
          {selectedCard && (
            <Button onClick={handleConfirm}>
              Confirm {selectedCard.name}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}