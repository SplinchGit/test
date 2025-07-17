import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput, validateUsername, ValidationError } from '@/utils/validation';
import type { PlayerCar } from '@/types/game';

// Mock database - replace with your actual database
interface Player {
  walletAddress: string;
  worldId: string;
  username: string;
  money: number;
  respect: number;
  rank: number;
  city: number;
  cars: PlayerCar[];
  lastActive: string;
  createdAt: string;
  bullets: number;
  kills: number;
  deaths: number;
  swissBank: number;
  stats: {
    crimesCommitted: number;
    crimesSuccessful: number;
    crimesFailed: number;
    timesJailed: number;
    timesHospitalized: number;
    totalMoneyEarned: number;
    totalRespectEarned: number;
    rankUps: number;
  };
}

// Mock storage - replace with actual database
const mockPlayers = new Map<string, Player>();
const mockUsernames = new Set<string>();

const GAME_CONFIG = {
  STARTING_MONEY: 1000,
  STARTING_RESPECT: 0,
  STARTING_BULLETS: 10,
  STARTING_SWISS_BANK: 0,
};

function generateGameId(): string {
  return `mafioso_${crypto.randomUUID().replace(/-/g, '')}`;
}

function generateAuthToken(player: Player): string {
  // In production, use proper JWT signing
  const payload = {
    walletAddress: player.walletAddress,
    username: player.username,
    gameId: player.worldId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };
  
  // This is a mock implementation - use proper JWT library in production
  return btoa(JSON.stringify(payload));
}

async function checkUsernameExists(username: string): Promise<boolean> {
  // Mock implementation - replace with actual database query
  return mockUsernames.has(username.toLowerCase());
}

async function createPlayer(walletAddress: string, username: string): Promise<Player> {
  const now = new Date().toISOString();
  const gameId = generateGameId();
  
  const player: Player = {
    walletAddress,
    worldId: gameId,
    username,
    money: GAME_CONFIG.STARTING_MONEY,
    respect: GAME_CONFIG.STARTING_RESPECT,
    rank: 0,
    city: 0, // Start in first city
    cars: [],
    lastActive: now,
    createdAt: now,
    bullets: GAME_CONFIG.STARTING_BULLETS,
    kills: 0,
    deaths: 0,
    swissBank: GAME_CONFIG.STARTING_SWISS_BANK,
    stats: {
      crimesCommitted: 0,
      crimesSuccessful: 0,
      crimesFailed: 0,
      timesJailed: 0,
      timesHospitalized: 0,
      totalMoneyEarned: 0,
      totalRespectEarned: 0,
      rankUps: 0
    }
  };
  
  // Mock storage - replace with actual database
  mockPlayers.set(walletAddress, player);
  mockUsernames.add(username.toLowerCase());
  
  return player;
}

async function getExistingPlayer(walletAddress: string): Promise<Player | null> {
  // Mock implementation - replace with actual database query
  return mockPlayers.get(walletAddress) || null;
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.walletAddress) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const sanitizedWallet = sanitizeInput.walletAddress(session.user.walletAddress);
    const existingPlayer = await getExistingPlayer(sanitizedWallet);
    
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
      walletAddress: sanitizedWallet
    });
    
  } catch (error) {
    console.error('Game initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.walletAddress) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Sanitize and validate inputs
    const sanitizedWallet = sanitizeInput.walletAddress(session.user.walletAddress);
    const sanitizedUsername = sanitizeInput.username(username);
    
    const usernameValidation = validateUsername(sanitizedUsername);
    if (!usernameValidation.isValid) {
      return NextResponse.json(
        { error: usernameValidation.error },
        { status: 400 }
      );
    }

    // Check if player already exists
    const existingPlayer = await getExistingPlayer(sanitizedWallet);
    if (existingPlayer) {
      return NextResponse.json(
        { error: 'Account already exists for this wallet' },
        { status: 409 }
      );
    }

    // Check if username is taken
    const usernameExists = await checkUsernameExists(sanitizedUsername);
    if (usernameExists) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Create new player
    const player = await createPlayer(sanitizedWallet, sanitizedUsername);
    const token = generateAuthToken(player);

    return NextResponse.json({
      success: true,
      player,
      token,
      hasAccount: true
    });

  } catch (error) {
    console.error('Game account creation error:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}