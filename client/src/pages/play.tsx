'use client'

import GwanGame from "@/components/gwan-game"
import { Button } from "@/components/ui/button"
import { useLocation, useSearchParams } from "wouter"
import { ArrowLeft } from "lucide-react"
import { AIDifficulty } from "@/lib/ai-strategy" // Import AI difficulty levels


export default function PlayPage() {
  const [, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'ai' ? 'ai' : 'pvp';
  const difficulty = searchParams.get('difficulty') as AIDifficulty || AIDifficulty.MEDIUM;

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
      <GwanGame mode={mode} aiDifficulty={difficulty} /> {/* Pass mode and difficulty to GwanGame */}
    </div>
  )
}