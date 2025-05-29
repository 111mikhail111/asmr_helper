import { videoThemeService } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const themeId = params.id;
    const themeWithTriggers = await videoThemeService.getThemeWithTriggers(themeId);
    return Response.json(themeWithTriggers);
  } catch (error) {
    return Response.json(
      { error: error.message || "Ошибка при получении темы" },
      { status: 500 }
    );
  }
}
