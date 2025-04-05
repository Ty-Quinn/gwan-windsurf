'use client'

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Medal, Crown, ChevronUp } from 'lucide-react';

export default function PlayerStats() {
  // In a real app, these would be fetched from an API
  const [stats, setStats] = useState({
    wins: 28,
    losses: 14,
    draws: 0,
    winRate: '67%',
    bestStreak: 5,
    currentStreak: 2,
    rankPosition: 42,
    rankChange: 7,
    eloRating: 1345,
    eloChange: 23
  });
  
  return (
    <Card className="bg-black/30 backdrop-blur-md border border-amber-900/50 p-6 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.1)] overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-amber-200">Player Statistics</h3>
          <div className="flex items-center bg-amber-900/30 rounded-full py-1 px-3">
            <Medal className="mr-2 h-4 w-4 text-amber-400" />
            <span className="text-amber-200 text-sm font-medium">Season 1</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Match Statistics */}
          <div className="space-y-4">
            <h4 className="text-amber-200/80 text-sm font-medium border-b border-amber-900/30 pb-2">Match Statistics</h4>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-amber-400 text-2xl font-bold">{stats.wins}</p>
                <p className="text-amber-200/70 text-xs">Wins</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-amber-400 text-2xl font-bold">{stats.losses}</p>
                <p className="text-amber-200/70 text-xs">Losses</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-amber-400 text-2xl font-bold">{stats.winRate}</p>
                <p className="text-amber-200/70 text-xs">Win Rate</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-amber-400 text-xl font-bold">{stats.bestStreak}</p>
                <p className="text-amber-200/70 text-xs">Best Streak</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-amber-400 text-xl font-bold">{stats.currentStreak}</p>
                <p className="text-amber-200/70 text-xs">Current Streak</p>
              </div>
            </div>
          </div>
          
          {/* Ranking Information */}
          <div className="space-y-4">
            <h4 className="text-amber-200/80 text-sm font-medium border-b border-amber-900/30 pb-2">Ranking</h4>
            
            <div className="flex gap-3">
              <div className="bg-black/30 rounded-lg p-3 text-center flex-1">
                <div className="flex items-center justify-center">
                  <p className="text-amber-400 text-2xl font-bold">#{stats.rankPosition}</p>
                  <div className="ml-2 flex items-center text-emerald-400">
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-xs">{stats.rankChange}</span>
                  </div>
                </div>
                <p className="text-amber-200/70 text-xs">Global Ranking</p>
              </div>
              
              <div className="bg-black/30 rounded-lg p-3 text-center flex-1">
                <div className="flex items-center justify-center">
                  <p className="text-amber-400 text-2xl font-bold">{stats.eloRating}</p>
                  <div className="ml-2 flex items-center text-emerald-400">
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-xs">{stats.eloChange}</span>
                  </div>
                </div>
                <p className="text-amber-200/70 text-xs">ELO Rating</p>
              </div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-amber-200/90 text-sm font-medium">Knight</p>
                  <p className="text-amber-200/60 text-xs">Current Rank</p>
                </div>
                <div className="relative">
                  <Crown className="h-8 w-8 text-amber-400" />
                  <div className="absolute -top-1 -right-1 bg-amber-800 rounded-full h-4 w-4 flex items-center justify-center text-[10px] text-amber-200 font-bold">3</div>
                </div>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 w-[65%]"></div>
              </div>
              <div className="flex justify-between text-[10px] text-amber-200/50 mt-1">
                <span>Knight</span>
                <span>Baron</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}