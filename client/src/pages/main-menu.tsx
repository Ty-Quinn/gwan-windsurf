
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Swords, Bot, Trophy, History, Star, Users, Medal } from "lucide-react"

// This would be fetched from your API in a real implementation
interface PlayerStats {
  username: string;
  totalMatches: number;
  wins: number;
  losses: number;
  rank: number;
  totalPlayers: number;
  winRate: number;
  recentMatches: {
    opponent: string;
    result: "win" | "loss";
    date: string;
    score: string;
  }[];
}

export default function MainMenu() {
  const navigate = useNavigate();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch player stats - this would connect to your backend API
  useEffect(() => {
    // Simulate API call with placeholder data
    setTimeout(() => {
      setPlayerStats({
        username: "Player1",
        totalMatches: 24,
        wins: 15,
        losses: 9,
        rank: 42,
        totalPlayers: 287,
        winRate: 62.5,
        recentMatches: [
          { opponent: "BattleMaster", result: "win", date: "2 hours ago", score: "2-0" },
          { opponent: "CardWizard", result: "loss", date: "Yesterday", score: "1-2" },
          { opponent: "StrategyKing", result: "win", date: "2 days ago", score: "2-1" }
        ]
      });
      setIsLoading(false);
    }, 500);
  }, []);

  const startPvPGame = () => {
    // In a real implementation, this would set up matchmaking
    navigate("/play");
  };

  const startAIGame = () => {
    // In a real implementation, this would set up a game against AI
    navigate("/play?mode=ai");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold gwan-header mb-2">GWAN</h1>
          <p className="text-muted-foreground">The Strategic Card Battle Game</p>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Game Modes Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Play Now</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PvP Card */}
              <Card className="hover:bg-card/90 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Swords className="mr-2 h-5 w-5 text-primary" />
                    Player vs Player
                  </CardTitle>
                  <CardDescription>
                    Battle against other players online
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {Math.floor(Math.random() * 120) + 30} players online
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Active
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={startPvPGame}>
                    Find Match <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
              
              {/* AI Card */}
              <Card className="hover:bg-card/90 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Bot className="mr-2 h-5 w-5 text-primary" />
                    Player vs AI
                  </CardTitle>
                  <CardDescription>
                    Practice against computer opponents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center">
                        <span className="w-16">Easy</span>
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: "30%" }}></div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-16">Medium</span>
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500" style={{ width: "60%" }}></div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="w-16">Hard</span>
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: "90%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" onClick={startAIGame}>
                    Start AI Game <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Tournaments & Events */}
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Tournaments & Events</h2>
              <Card className="overflow-hidden">
                <div className="px-4 py-3 bg-primary/10 font-medium flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-primary" />
                    <span>Upcoming Events</span>
                  </div>
                  <Button variant="link" size="sm" className="p-0">
                    View All
                  </Button>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Weekend Tournament</h3>
                        <p className="text-sm text-muted-foreground">Starts in 2 days</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Register
                      </Button>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Seasonal Championship</h3>
                        <p className="text-sm text-muted-foreground">Starts in 2 weeks</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Register
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Player Stats Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Player Profile</h2>
            
            {isLoading ? (
              <Card className="p-6">
                <div className="flex flex-col space-y-4 items-center">
                  <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
                  <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                  <div className="grid grid-cols-3 gap-4 w-full mt-2">
                    <div className="h-12 bg-muted animate-pulse rounded"></div>
                    <div className="h-12 bg-muted animate-pulse rounded"></div>
                    <div className="h-12 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </Card>
            ) : (
              <Tabs defaultValue="stats">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="achievements">Ranks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="stats">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>{playerStats?.username}</CardTitle>
                        <Badge className="bg-primary/20 text-primary border-primary/20">
                          Rank #{playerStats?.rank}
                        </Badge>
                      </div>
                      <CardDescription>
                        Member since April 2025
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-400">{playerStats?.totalMatches}</div>
                          <div className="text-xs text-muted-foreground">Matches</div>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">{playerStats?.wins}</div>
                          <div className="text-xs text-muted-foreground">Wins</div>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-red-400">{playerStats?.losses}</div>
                          <div className="text-xs text-muted-foreground">Losses</div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span>Win Rate</span>
                          <span className="font-medium">{playerStats?.winRate}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-500 to-primary" 
                            style={{ width: `${playerStats?.winRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Matches</CardTitle>
                      <CardDescription>
                        Your last {playerStats?.recentMatches.length} matches
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border">
                        {playerStats?.recentMatches.map((match, index) => (
                          <div key={index} className="flex items-center justify-between p-4">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                match.result === "win" ? "bg-green-500" : "bg-red-500"
                              }`}></div>
                              <div>
                                <div className="font-medium">vs. {match.opponent}</div>
                                <div className="text-xs text-muted-foreground">{match.date}</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm font-semibold">{match.score}</span>
                              <History className="ml-2 h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button variant="outline" className="w-full text-sm">
                        View All Match History
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="achievements">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ranking</CardTitle>
                      <CardDescription>
                        You are ranked #{playerStats?.rank} out of {playerStats?.totalPlayers} players
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <Medal className="h-10 w-10 text-yellow-500 mr-3" />
                          <div>
                            <div className="font-medium">Gold League</div>
                            <div className="text-xs text-muted-foreground">Top 20% of players</div>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <div className="text-sm font-medium mb-2">Progress to next rank</div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: "65%" }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Current: Gold</span>
                            <span>Next: Platinum (15 more wins)</span>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <div className="text-sm font-medium mb-2">Leaderboard Preview</div>
                          <div className="divide-y divide-border border rounded-lg">
                            <div className="flex items-center p-3">
                              <span className="w-8 text-center font-bold text-muted-foreground">#41</span>
                              <span className="flex-1 ml-2">CardMaster</span>
                              <span className="text-yellow-400">32 wins</span>
                            </div>
                            <div className="flex items-center p-3 bg-primary/10">
                              <span className="w-8 text-center font-bold text-primary">#42</span>
                              <span className="flex-1 ml-2 font-medium">{playerStats?.username}</span>
                              <span className="text-yellow-400">{playerStats?.wins} wins</span>
                            </div>
                            <div className="flex items-center p-3">
                              <span className="w-8 text-center font-bold text-muted-foreground">#43</span>
                              <span className="flex-1 ml-2">StrategyPro</span>
                              <span className="text-yellow-400">29 wins</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button variant="outline" className="w-full text-sm">
                        View Full Leaderboard
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
