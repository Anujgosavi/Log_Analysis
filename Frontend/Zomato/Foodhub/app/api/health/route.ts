import connectDB from "@/lib/mongodb";
import logger from "@/lib/logger";

export async function GET() {
  try {
    logger.info("GET /api/health - Health check requested");
    await connectDB();
    logger.info("GET /api/health - Health check passed");
    return new Response(
      JSON.stringify({ ok: true, message: "MongoDB connected successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    logger.error("GET /api/health - Health check failed:", err);
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
