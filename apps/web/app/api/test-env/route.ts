/**
 * Test API route to verify environment configuration
 * This can be accessed at /api/test-env
 */

import { env } from "@/lib/config/env";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test that env is accessible and has expected values
    const config = {
      nodeEnv: env.nodeEnv,
      isDevelopment: env.isDevelopment,
      useMockData: env.useMockData,
      apiUrl: env.apiUrl,
      wsUrl: env.wsUrl,
      apiTimeout: env.apiTimeout,
      awsRegion: env.aws.region,
    };

    return NextResponse.json({
      success: true,
      message: "Environment configuration loaded successfully",
      config,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load environment configuration",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
