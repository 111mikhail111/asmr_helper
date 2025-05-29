// app/api/video_themes/triggers/route.js
import { videoThemeTriggersService } from "@/lib/db";

export async function POST(request) {
  try {
    const { themeId, triggers } = await request.json();

    const result = await videoThemeTriggersService.updateThemeTriggers(
      themeId,
      triggers
    );
    return Response.json(result);
  } catch (error) {
    console.error("Ошибка при сохранении триггеров темы:", error);
    return Response.json(
      {
        error: error.message || "Ошибка при сохранении триггеров темы",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Можно добавить GET-эндпоинт для получения триггеров темы
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get("themeId");

    if (!themeId) {
      return Response.json({ error: "Не указан ID темы" }, { status: 400 });
    }

    const triggers = await videoThemeTriggersService.getTriggersByThemeId(themeId);
    return Response.json(triggers);
  } catch (error) {
    console.error("Ошибка при получении триггеров темы:", error);
    return Response.json(
      {
        error: error.message || "Ошибка при получении триггеров темы",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
