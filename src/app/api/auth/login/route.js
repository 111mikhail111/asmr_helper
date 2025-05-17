import db from '@/lib/db'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      return Response.json({ message: 'Пользователь не найден' }, { status: 401 })
    }

    // Здесь должна быть проверка пароля (например, с bcrypt)
    if (user.password_hash !== password) { // В реальном приложении используйте хеширование!
      return Response.json({ message: 'Неверный пароль' }, { status: 401 })
    }

    return Response.json({ 
      user: { 
        id: user.id, 
        username: user.username,
        email: user.email,
        // Добавьте другие нужные поля
      } 
    })
  } catch (error) {
    return Response.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}