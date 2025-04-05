"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import GwanGame from "@/components/gwan-game"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp");
  
  useEffect(() => {
    // Determine if it's an AI game from the URL parameter
    const mode = searchParams.get("mode");
    if (mode === "ai") {
      setGameMode("ai");
    }
  }, [searchParams]);
  
  return (
    <main className="min-h-screen bg-background text-foreground p-4 pt-8">
      <div className="container mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Menu
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {gameMode === "pvp" ? "Player vs Player" : "Player vs AI"}
          </div>
        </div>
        
        <GwanGame />
      </div>
    </main>
  )
}
