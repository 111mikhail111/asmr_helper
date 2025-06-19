import db from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const themeId = searchParams.get("themeId");

  try {
    const triggers = await db.getAllTriggersByTheme(themeId);
    return Response.json(triggers);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
