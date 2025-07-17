import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput, validateUsername, ValidationError } from '@/utils/validation';

// Mock username storage - replace with actual database
const mockUsernames = new Set<string>();

async function checkUsernameExists(username: string): Promise<boolean> {
  // Mock implementation - replace with actual database query
  // In production, this would query your database's username index
  return mockUsernames.has(username.toLowerCase());
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      );
    }

    // Sanitize and validate username
    const sanitizedUsername = sanitizeInput.username(username);
    const validation = validateUsername(sanitizedUsername);
    
    if (!validation.isValid) {
      return NextResponse.json({
        available: false,
        error: validation.error
      });
    }

    // Check if username exists
    const exists = await checkUsernameExists(sanitizedUsername);

    return NextResponse.json({
      available: !exists,
      username: sanitizedUsername
    });

  } catch (error) {
    console.error('Username check error:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { available: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { available: false, error: 'Failed to check username availability' },
      { status: 500 }
    );
  }
}