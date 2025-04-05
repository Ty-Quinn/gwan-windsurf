
import express from 'express';
import { db } from '../db';
import { users } from '../models/user';
import { matches } from '../models/match';
import { eq, desc, sql, and, or } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get current user's stats
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user stats
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        username: true,
        totalMatches: true,
        wins: true,
        losses: true,
        draws: true,
        rankPoints: true,
        createdAt: true,
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate win rate
    const winRate = user.totalMatches > 0 
      ? Math.round((user.wins / user.totalMatches) * 100) 
      : 0;
    
    // Get user rank
    const rankQuery = await db.select({
      rank: sql`row_number() over (order by ${users.rankPoints} desc)`,
      userId: users.id
    })
    .from(users)
    .execute();
    
    const userRank = rankQuery.find(r => r.userId === userId)?.rank || 0;
    const totalPlayers = rankQuery.length;
    
    // Get recent matches
    const recentMatches = await db.select({
      id: matches.id,
      opponent: sql`
        CASE 
          WHEN ${matches.player1Id} = ${userId} THEN (SELECT username FROM users WHERE id = ${matches.player2Id})
          ELSE (SELECT username FROM users WHERE id = ${matches.player1Id})
        END
      `,
      playerScore: sql`
        CASE 
          WHEN ${matches.player1Id} = ${userId} THEN ${matches.player1Score}
          ELSE ${matches.player2Score}
        END
      `,
      opponentScore: sql`
        CASE 
          WHEN ${matches.player1Id} = ${userId} THEN ${matches.player2Score}
          ELSE ${matches.player1Score}
        END
      `,
      result: sql`
        CASE 
          WHEN ${matches.winnerId} = ${userId} THEN 'win'
          WHEN ${matches.winnerId} IS NULL THEN 'draw'
          ELSE 'loss'
        END
      `,
      gameType: matches.gameType,
      endedAt: matches.endedAt,
    })
    .from(matches)
    .where(
      or(
        eq(matches.player1Id, userId),
        eq(matches.player2Id, userId)
      )
    )
    .orderBy(desc(matches.endedAt))
    .limit(10)
    .execute();
    
    // Format matches for display
    const formattedMatches = recentMatches.map(match => ({
      id: match.id,
      opponent: match.opponent,
      result: match.result,
      score: `${match.playerScore}-${match.opponentScore}`,
      gameType: match.gameType,
      date: new Date(match.endedAt).toISOString(),
    }));
    
    res.json({
      username: user.username,
      totalMatches: user.totalMatches,
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
      winRate,
      rank: userRank,
      totalPlayers,
      memberSince: user.createdAt,
      recentMatches: formattedMatches
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;
    
    // Get top players by rank points
    const leaderboard = await db.select({
      id: users.id,
      username: users.username,
      wins: users.wins,
      totalMatches: users.totalMatches,
      rankPoints: users.rankPoints,
      rank: sql`row_number() over (order by ${users.rankPoints} desc)`,
    })
    .from(users)
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(users.rankPoints))
    .execute();
    
    const totalPlayers = await db.select({
      count: sql`count(*)`,
    })
    .from(users)
    .execute()
    .then(result => Number(result[0].count));
    
    res.json({
      leaderboard,
      pagination: {
        page,
        pageSize,
        totalPages: Math.ceil(totalPlayers / pageSize),
        totalPlayers,
      }
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ message: 'Server error while fetching leaderboard' });
  }
});

export default router;
