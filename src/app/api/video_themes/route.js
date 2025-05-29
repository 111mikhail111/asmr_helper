// app/api/video_themes/route.js
import { videoThemeService } from "@/lib/db";

export async function POST(request) {
  try {
    const { name, duration } = await request.json();

    // Проверяем существующую тему
    const existingTheme = await videoThemeService.getThemeByName(name);
    if (existingTheme) {
      return Response.json(existingTheme);
    }

    // Создаем новую тему
    const newTheme = await videoThemeService.createTheme(name, duration);
    return Response.json(newTheme);
  } catch (error) {
    console.error("Ошибка при сохранении темы:", error);
    return Response.json(
      { error: error.message || "Ошибка при сохранении темы" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const themes = await videoThemeService.getAllThemes();
    return Response.json(themes);
  } catch (error) {
    console.error("Ошибка при получении тем:", error);
    return Response.json(
      { error: error.message || "Ошибка при получении тем" },
      { status: 500 }
    );
  }
}
