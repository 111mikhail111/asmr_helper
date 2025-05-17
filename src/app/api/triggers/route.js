import db from "@/lib/db";

export async function GET() {
  try {
    const triggers = db.getAllTriggers();
    return Response.json(triggers);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, description, triggerTypeId, audioFile } = await request.json();
    const result = db.addTrigger(name, description, triggerTypeId, audioFile);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
