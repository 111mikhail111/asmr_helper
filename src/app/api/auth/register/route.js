import db from "@/lib/db";

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    // Проверка существующего пользователя
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return Response.json(
        { message: "Email уже используется" },
        { status: 400 }
      );
    }

    // В реальном приложении хешируйте пароль!
    const newUser = await db.addUser(username, email, password);

    return Response.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        created_at: Date.now(),
        // Добавьте другие нужные поля
      },
    });
  } catch (error) {
    return Response.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}
