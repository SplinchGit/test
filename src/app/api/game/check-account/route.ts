import { NextRequest, NextResponse } from 'next/server';
import type { Player } from '@/types/game';

// Import the mock storage from initialize route - in production, use shared database access
// For now, we'll use a global store that both endpoints can access
declare global {
  var mockPlayers: Map<string, Player> | undefined;
}

if (!global.mockPlayers) {
  global.mockPlayers = new Map<string, Player>();
}

function generateAuthToken(player: Player): string {
  // In production, use proper JWT signing
  const payload = {
    nullifierHash: player.walletAddress, // Using walletAddress field to store nullifier
    username: player.username,
    gameId: player.worldId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };
  
  // This is a mock implementation - use proper JWT library in production
  return btoa(JSON.stringify(payload));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nullifierHash } = body;

    if (!nullifierHash) {
      return NextResponse.json(
        { error: 'Nullifier hash is required' },
        { status: 400 }
      );
    }

    // Check if player exists with this nullifier hash
    // In production, query your database
    const existingPlayer = global.mockPlayers?.get(nullifierHash);
    
    if (existingPlayer) {
      // Update last active time
      existingPlayer.lastActive = new Date().toISOString();
      
      const token = generateAuthToken(existingPlayer);
      
      return NextResponse.json({
        success: true,
        player: existingPlayer,
        token,
        hasAccount: true
      });
    }
    
    return NextResponse.json({
      success: true,
      hasAccount: false,
      nullifierHash
    });
    
  } catch (error) {
    console.error('Account check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}