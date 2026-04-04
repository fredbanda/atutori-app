import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let handler: ReturnType<typeof toNextJsHandler> | null = null;

try {
  // Log types of critical env vars to help debug invalid types being passed
  console.log(
    "[auth route] BETTER_AUTH_SECRET type:",
    typeof process.env.BETTER_AUTH_SECRET
  );
  console.log(
    "[auth route] DATABASE_URL type:",
    typeof process.env.DATABASE_URL
  );

  handler = toNextJsHandler(auth);
} catch (err) {
  console.error("Failed to create better-auth handler:", err);
}

export const GET = async (req: Request) => {
  if (!handler) {
    console.error("Auth handler is not initialized");
    return new Response("Server error", { status: 500 });
  }

  try {
    return await handler.GET(req as any);
  } catch (err) {
    console.error("Error in auth GET:", err);
    throw err;
  }
};

export const POST = async (req: Request) => {
  if (!handler) {
    console.error("Auth handler is not initialized");
    return new Response("Server error", { status: 500 });
  }

  try {
    const res = await handler.POST(req as any);
    console.log("[auth POST] status:", res.status);
    console.log("[auth POST] set-cookie:", res.headers.get("set-cookie"));
    return res;
  } catch (err) {
    console.error("Error in auth POST:", err);
    throw err;
  }
};


