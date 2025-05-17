import { favoriteThemesService } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    console.log("Получение избранных тем для пользователя:", params.id);
    const userId = params.id;

    const favoriteThemes =
      favoriteThemesService.getFavoriteThemesByUserId(userId);

    console.log("Результат запроса:", favoriteThemes);
    return Response.json(favoriteThemes);
  } catch (error) {
    console.error("Ошибка при получении избранных тем:", error);
    return Response.json(
      {
        error: "Ошибка при получении избранных тем",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const userId = params.id;
    const { themeId } = await request.json();

    // Валидация входных данных
    if (!userId || !themeId) {
      return Response.json(
        { error: "Не указаны userId или themeId" },
        { status: 400 }
      );
    }

    const result = favoriteThemesService.addFavoriteTheme(userId, themeId);

    if (!result.success) {
      return Response.json(
        { message: result.message },
        { status: 200 } // 200 OK, так как это не ошибка, а информационное сообщение
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Ошибка при добавлении в избранное:", error);
    return Response.json(
      {
        error: "Ошибка при добавлении в избранное",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
