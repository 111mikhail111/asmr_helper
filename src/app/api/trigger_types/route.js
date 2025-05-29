import db from "@/lib/db";

export async function GET() {
  try {
    const triggers = await db.getAllTriggerTypes();
    return Response.json(triggers);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, description } = await request.json();
    const result = await db.addTriggerType(name, description);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}