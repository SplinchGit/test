import {
  ISuccessResult,
  IVerifyResponse,
  verifyCloudProof,
} from '@worldcoin/minikit-js';
import { NextRequest, NextResponse } from 'next/server';

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal: string | undefined;
}

/**
 * This route is used to verify the proof of the user
 * It is critical proofs are verified from the server side
 * Read More: https://docs.world.org/mini-apps/commands/verify#verifying-the-proof
 */
export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = (await req.json()) as IRequestPayload;
    const app_id = process.env.WORLD_APP_ID as `app_${string}`;

    console.log('Environment check:');
    console.log('- WORLD_APP_ID exists:', !!process.env.WORLD_APP_ID);
    console.log('- App ID value:', app_id?.substring(0, 10) + '...' || 'undefined');
    console.log('Action:', action);
    console.log('Has payload:', !!payload);

    if (!app_id) {
      console.error('WORLD_APP_ID environment variable not configured');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('WORLD')));
      return NextResponse.json({ 
        verifyRes: { 
          success: false, 
          detail: 'Server configuration error: WORLD_APP_ID not found in environment variables' 
        } 
      }, { status: 500 });
    }

    if (!app_id.startsWith('app_')) {
      console.error('Invalid WORLD_APP_ID format. Expected format: app_xxxxx');
      return NextResponse.json({ 
        verifyRes: { 
          success: false, 
          detail: 'Server configuration error: Invalid WORLD_APP_ID format' 
        } 
      }, { status: 500 });
    }

    const verifyRes = (await verifyCloudProof(
      payload,
      app_id,
      action,
      signal,
    )) as IVerifyResponse;

    console.log('Verification result:', verifyRes);

    if (verifyRes.success) {
      // This is where you should perform backend actions if the verification succeeds
      // Such as, setting a user as "verified" in a database
      return NextResponse.json({ verifyRes, status: 200 });
    } else {
      // This is where you should handle errors from the World ID /verify endpoint.
      // Usually these errors are due to a user having already verified.
      return NextResponse.json({ verifyRes, status: 400 });
    }
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      verifyRes: { success: false, detail: 'Internal server error' } 
    }, { status: 500 });
  }
}
