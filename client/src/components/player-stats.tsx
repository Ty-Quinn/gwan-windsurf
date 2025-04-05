'use client'

import { Card } from "@/components/ui/card"
import { Trophy, Award, TrendingUp, Flame } from "lucide-react"

// Mock data - would be fetched from API in a real app
const playerStats = {
  name: "Player 1",
  totalMatches: 42,
  wins: 28,
  losses: 14,
  winRate: 66.7,
  currentStreak: 3,
  bestStreak: 7,
}

export default function PlayerStats() {
  return (
    <Card className="bg-black/30 backdrop-blur-md border border-amber-900/50 p-6 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.1)] overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-amber-200">Your Stats</h2>
          <div className="bg-amber-900/50 p-2 rounded-full">
            <Trophy className="h-5 w-5 text-amber-300" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-amber-200/70">Player Name</span>
            <span className="font-bold text-xl text-amber-100">{playerStats.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-black/40 to-black/20 p-4 rounded-xl border border-amber-900/30">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-amber-400" />
                <div className="text-amber-200/70 text-sm">Total Matches</div>
              </div>
              <div className="text-2xl font-bold text-amber-100">{playerStats.totalMatches}</div>
            </div>

            <div className="bg-gradient-to-br from-black/40 to-black/20 p-4 rounded-xl border border-amber-900/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                <div className="text-amber-200/70 text-sm">Win Rate</div>
              </div>
              <div className="text-2xl font-bold text-amber-100">{playerStats.winRate}%</div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-gradient-to-br from-black/40 to-black/20 p-4 rounded-xl border border-amber-900/30">
              <div className="text-amber-200/70 text-sm mb-1">Wins</div>
              <div className="text-2xl font-bold text-emerald-400">{playerStats.wins}</div>
            </div>

            <div className="flex-1 bg-gradient-to-br from-black/40 to-black/20 p-4 rounded-xl border border-amber-900/30">
              <div className="text-amber-200/70 text-sm mb-1">Losses</div>
              <div className="text-2xl font-bold text-rose-400">{playerStats.losses}</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-amber-200/70">Win/Loss Ratio</span>
              <span className="text-amber-200">
                {playerStats.wins} / {playerStats.losses}
              </span>
            </div>
            <div className="h-3 bg-black/40 rounded-full overflow-hidden">
              <div className="flex h-full">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full"
                  style={{ width: `${playerStats.winRate}%` }}
                />
                <div
                  className="bg-gradient-to-r from-rose-500 to-rose-400 h-full"
                  style={{ width: `${100 - playerStats.winRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="bg-gradient-to-br from-black/40 to-black/20 p-3 rounded-xl border border-amber-900/30 flex items-center gap-3">
              <Flame className="h-5 w-5 text-amber-400" />
              <div>
                <span className="text-amber-200/70 text-xs">Current Streak</span>
                <div className="text-lg font-bold text-amber-100">{playerStats.currentStreak} wins</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-black/40 to-black/20 p-3 rounded-xl border border-amber-900/30 flex items-center gap-3">
              <Flame className="h-5 w-5 text-amber-400" />
              <div>
                <span className="text-amber-200/70 text-xs">Best Streak</span>
                <div className="text-lg font-bold text-amber-100">{playerStats.bestStreak} wins</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}