'use client'

import MultiplayerGame from "@/components/multiplayer-game"
import { Button } from "@/components/ui/button"
import { useLocation } from "wouter"
import { ArrowLeft } from "lucide-react"

export default function MultiplayerPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0b] to-[#2a1a14]">
      <div className="p-4">
        <Button
          variant="outline"
          className="mb-4 border-amber-500/50 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
      </div>
      <MultiplayerGame />
    </div>
  )
}
