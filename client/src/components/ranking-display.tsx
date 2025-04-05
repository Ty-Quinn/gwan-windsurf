'use client'

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Trophy, Award, TrendingUp, Flame } from 'lucide-react';

interface RankedPlayer {
  id: number;
  name: string;
  rank: number;
  eloRating: number;
  winRate: string;
  streak: number;
  isCurrentPlayer?: boolean;
}

export default function RankingDisplay() {
  // In a real app, this would be fetched from an API
  const [topPlayers, setTopPlayers] = useState<RankedPlayer[]>([
    {
      id: 1,
      name: "Dragonmaster",
      rank: 1,
      eloRating: 2187,
      winRate: "89%",
      streak: 12
    },
    {
      id: 2,
      name: "CardWizard",
      rank: 2,
      eloRating: 2145,
      winRate: "87%",
      streak: 9
    },
    {
      id: 3,
      name: "TacticalGenius",
      rank: 3,
      eloRating: 2102,
      winRate: "84%",
      streak: 7
    },
    {
      id: 4,
      name: "GwanChampion",
      rank: 4,
      eloRating: 1982,
      winRate: "82%",
      streak: 6
    },
    {
      id: 5,
      name: "StrategistPrime",
      rank: 5,
      eloRating: 1943,
      winRate: "81%",
      streak: 4
    }
  ]);
  
  // Current player's ranking
  const [playerRanking, setPlayerRanking] = useState<RankedPlayer>({
    id: 42,
    name: "You",
    rank: 42,
    eloRating: 1345,
    winRate: "67%",
    streak: 2,
    isCurrentPlayer: true
  });
  
  return (
    <Card className="bg-black/30 backdrop-blur-md border border-amber-900/50 p-6 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.1)] overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-amber-200">Global Rankings</h3>
          <div className="flex items-center bg-amber-900/30 rounded-full py-1 px-3">
            <Trophy className="mr-2 h-4 w-4 text-amber-400" />
            <span className="text-amber-200 text-sm font-medium">Top Players</span>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 text-amber-200/60 text-xs font-medium px-3">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 text-center">Rating</div>
            <div className="col-span-2 text-center">Win %</div>
            <div className="col-span-2 text-center">Streak</div>
          </div>
          
          {/* Top 5 Players List */}
          {topPlayers.map((player) => (
            <div 
              key={player.id}
              className="grid grid-cols-12 gap-2 bg-black/30 rounded-lg p-3 items-center text-sm transition-colors hover:bg-black/40"
            >
              <div className="col-span-1 flex justify-center items-center">
                {player.rank === 1 ? (
                  <div className="rounded-full bg-amber-400/20 p-1.5">
                    <Trophy className="h-4 w-4 text-amber-400" />
                  </div>
                ) : (
                  <span className="font-bold text-amber-300">#{player.rank}</span>
                )}
              </div>
              <div className="col-span-5 font-medium text-amber-200">{player.name}</div>
              <div className="col-span-2 text-center text-amber-400 font-semibold">{player.eloRating}</div>
              <div className="col-span-2 text-center text-amber-300">{player.winRate}</div>
              <div className="col-span-2 text-center flex justify-center items-center">
                <span className="text-amber-300 mr-1">{player.streak}</span>
                <Flame className="h-3 w-3 text-amber-400" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Your ranking */}
        <div className="mt-6 pt-4 border-t border-amber-900/30">
          <h4 className="text-amber-200/80 text-sm font-medium mb-3">Your Ranking</h4>
          <div className="grid grid-cols-12 gap-2 bg-amber-900/20 rounded-lg p-3 items-center text-sm border border-amber-500/20">
            <div className="col-span-1 flex justify-center items-center">
              <span className="font-bold text-amber-300">#{playerRanking.rank}</span>
            </div>
            <div className="col-span-5 font-medium text-amber-100">{playerRanking.name}</div>
            <div className="col-span-2 text-center text-amber-400 font-semibold">{playerRanking.eloRating}</div>
            <div className="col-span-2 text-center text-amber-300">{playerRanking.winRate}</div>
            <div className="col-span-2 text-center flex justify-center items-center">
              <span className="text-amber-300 mr-1">{playerRanking.streak}</span>
              <Flame className="h-3 w-3 text-amber-400" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}