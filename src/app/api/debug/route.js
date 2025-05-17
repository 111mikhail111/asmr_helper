export async function GET() {
  return Response.json({
    envKey: process.env.OPENROUTER_API_KEY ? "exists" : "missing",
    typeofProcess: typeof process,
  });
}
