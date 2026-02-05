import { NextResponse } from "next/server";
import { runAgent } from "@/modules/ai/agent";

// Allow this to run for up to 5 minutes (Agents can be slow)
export const maxDuration = 300;

export async function GET(req: Request) {
  try {
    // Optional: Security Check (Uncomment for production)
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    console.log("⏳ Triggering AI Agent...");
    const result = await runAgent();

    return NextResponse.json({
      success: true,
      message: "Agent finished successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Agent failed:", error);
    return NextResponse.json(
      { success: false, error: "Agent failed to run" },
      { status: 500 },
    );
  }
}
