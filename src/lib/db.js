import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// Основные методы работы с БД
export default {
  // Добавить триггер
  addTrigger: async (name, description, triggerTypeId, audio_path = null) => {
    const res = await pool.query(
      `INSERT INTO trigger (name, description, trigger_type_id, audio_file_path)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, triggerTypeId, audio_path]
    );
    return res.rows[0];
  },

  // Добавить тип триггера
  addTriggerType: async (name, description) => {
    const res = await pool.query(
      `INSERT INTO trigger_type (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name, description]
    );
    return res.rows[0];
  },

  // Получить все триггеры
  getAllTriggers: async () => {
    const res = await pool.query(`
      SELECT t.*, tt.name AS trigger_type_name 
      FROM trigger t
      LEFT JOIN trigger_type tt ON t.trigger_type_id = tt.id
    `);
    return res.rows;
  },

  getAllTriggersByTheme: async (themeId) => {
    const res = await pool.query(`
      SELECT t.name AS trigger_type_name 
      FROM trigger t
      LEFT JOIN trigger_type tt ON t.trigger_type_id = tt.id
      WHERE tt.id = $1
    `, [themeId]);
    return res.rows;
  },

  // Получить все типы триггеров
  getAllTriggerTypes: async () => {
    const res = await pool.query("SELECT * FROM trigger_type");
    return res.rows;
  },

  // Добавить пользователя
  addUser: async (username, email, passwordHash) => {
    const res = await pool.query(
      `INSERT INTO app_user (username, email, password_hash, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [username, email, passwordHash]
    );
    return res.rows[0];
  },

  // Получить пользователя по email
  getUserByEmail: async (email) => {
    const res = await pool.query("SELECT * FROM app_user WHERE email = $1", [
      email,
    ]);
    return res.rows[0];
  },

  // Добавить триггер в избранное пользователя
  addFavoriteTrigger: async (userId, triggerId) => {
    try {
      const res = await pool.query(
        `INSERT INTO user_favorite_triggers (user_id, trigger_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, trigger_id) DO NOTHING
         RETURNING *`,
        [userId, triggerId]
      );
      return { success: !!res.rows[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateTrigger(id, name, description, triggerTypeId, audioFile) {
    const res = await pool.query(
      `UPDATE trigger
       SET name = $1, description = $2, trigger_type_id = $3, audio_file_path = $4
       WHERE id = $5
       RETURNING *`,
      [name, description, triggerTypeId, audioFile, id]
    );
    return res.rows[0];
  },

  async deleteTrigger(id) {
    const res = await pool.query(
      `DELETE FROM trigger WHERE id = $1 RETURNING *`,
      [id]
    );
    return { success: res.rows.length > 0 };
  },
};

// Сервис для работы с избранными темами
export const favoriteThemesService = {
  // Получить избранные темы пользователя
  getFavoriteThemesByUserId: async (userId) => {
    if (!userId || isNaN(userId)) {
      throw new Error("Неверный ID пользователя");
    }

    const res = await pool.query(
      `SELECT vt.* 
       FROM user_favorite_themes uft
       JOIN video_theme vt ON uft.video_theme_id = vt.id
       WHERE uft.user_id = $1`,
      [userId]
    );
    return res.rows;
  },

  // Добавить тему в избранное
  addFavoriteTheme: async (userId, themeId) => {
    // Проверяем существование записи
    const existing = await pool.query(
      `SELECT 1 FROM user_favorite_themes 
       WHERE user_id = $1 AND video_theme_id = $2`,
      [userId, themeId]
    );

    if (existing.rows.length > 0) {
      return { success: false, message: "Тема уже в избранном" };
    }

    // Добавляем в избранное
    await pool.query(
      `INSERT INTO user_favorite_themes (user_id, video_theme_id)
       VALUES ($1, $2)`,
      [userId, themeId]
    );

    return { success: true };
  },

  // Удалить тему из избранного
  removeFavoriteTheme: async (userId, themeId) => {
    const res = await pool.query(
      `DELETE FROM user_favorite_themes
       WHERE user_id = $1 AND video_theme_id = $2
       RETURNING *`,
      [userId, themeId]
    );
    return { success: res.rows.length > 0 };
  },
};

// Сервис для работы с темами видео
export const videoThemeService = {
  // Получить все темы
  getAllThemes: async () => {
    const res = await pool.query("SELECT * FROM video_theme");
    return res.rows;
  },

  // Найти тему по имени
  getThemeByName: async (name) => {
    const res = await pool.query("SELECT * FROM video_theme WHERE name = $1", [
      name,
    ]);
    return res.rows[0];
  },

  // Создать новую тему
  createTheme: async (name, duration) => {
    const res = await pool.query(
      `INSERT INTO video_theme (name, duration)
       VALUES ($1, $2)
       RETURNING *`,
      [name, duration]
    );
    return res.rows[0];
  },

  // Получить тему по ID
  getThemeById: async (id) => {
    const res = await pool.query("SELECT * FROM video_theme WHERE id = $1", [
      id,
    ]);
    return res.rows[0];
  },

  // Обновить тему
  updateTheme: async (id, updates) => {
    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");
    const values = Object.values(updates);
    values.push(id);

    const query = `
      UPDATE video_theme
      SET ${fields}
      WHERE id = $${values.length}
      RETURNING *
    `;

    const res = await pool.query(query, values);
    return res.rows[0];
  },

  // Удалить тему
  deleteTheme: async (id) => {
    const res = await pool.query(
      "DELETE FROM video_theme WHERE id = $1 RETURNING *",
      [id]
    );
    return { success: res.rows.length > 0 };
  },

  // Получить тему с триггерами
  getThemeWithTriggers: async (themeId) => {
    // Получаем основную информацию о теме
    const themeRes = await pool.query(
      `SELECT id, name AS title, duration 
       FROM video_theme 
       WHERE id = $1`,
      [themeId]
    );

    if (!themeRes.rows[0]) {
      throw new Error("Тема не найдена");
    }

    const theme = themeRes.rows[0];

    // Получаем все триггеры для темы
    const triggersRes = await pool.query(
      `SELECT 
         t.name,
         vtt.timecode,
         vtt.duration
       FROM video_theme_triggers vtt
       JOIN trigger t ON vtt.trigger_id = t.id
       WHERE vtt.video_theme_id = $1
       ORDER BY vtt.timecode`,
      [themeId]
    );

    // Форматируем результат
    return {
      title: theme.title,
      duration: theme.duration,
      triggers: triggersRes.rows.map((trigger) => ({
        timecode: trigger.timecode,
        name: trigger.name,
        duration: trigger.duration,
      })),
    };
  },
};

// Сервис для работы с триггерами тем
export const videoThemeTriggersService = {
  // Получить триггеры по ID темы
  getTriggersByThemeId: async (themeId) => {
    const res = await pool.query(
      `SELECT t.*, vtt.timecode, vtt.duration
       FROM video_theme_triggers vtt
       JOIN trigger t ON vtt.trigger_id = t.id
       WHERE vtt.video_theme_id = $1`,
      [themeId]
    );
    return res.rows;
  },

  // Найти триггер по имени
  getTriggerByName: async (name) => {
    const res = await pool.query("SELECT id FROM trigger WHERE name = $1", [
      name,
    ]);
    return res.rows[0];
  },

  // Обновить триггеры для темы (полная замена)
  updateThemeTriggers: async (themeId, triggers) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Получаем ID триггеров по их именам
      const triggerIds = [];
      for (const trigger of triggers) {
        const res = await client.query(
          "SELECT id FROM trigger WHERE name = $1",
          [trigger.name]
        );

        if (!res.rows[0]) {
          throw new Error(`Триггер '${trigger.name}' не найден`);
        }

        triggerIds.push({
          id: res.rows[0].id,
          timecode: trigger.timecode,
          duration: trigger.duration,
        });
      }

      // Удаляем старые триггеры темы
      await client.query(
        "DELETE FROM video_theme_triggers WHERE video_theme_id = $1",
        [themeId]
      );

      // Сохраняем новые триггеры темы
      for (const { id, timecode, duration } of triggerIds) {
        await client.query(
          `INSERT INTO video_theme_triggers 
           (video_theme_id, trigger_id, timecode, duration)
           VALUES ($1, $2, $3, $4)`,
          [themeId, id, timecode, duration]
        );
      }

      await client.query("COMMIT");
      return { success: true, count: triggerIds.length };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Добавить один триггер к теме
  addTriggerToTheme: async (themeId, triggerId, timecode, duration) => {
    const res = await pool.query(
      `INSERT INTO video_theme_triggers 
       (video_theme_id, trigger_id, timecode, duration)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (video_theme_id, trigger_id) 
       DO UPDATE SET timecode = $3, duration = $4
       RETURNING *`,
      [themeId, triggerId, timecode, duration]
    );
    return res.rows[0];
  },

  // Удалить триггер из темы
  removeTriggerFromTheme: async (themeId, triggerId) => {
    const res = await pool.query(
      `DELETE FROM video_theme_triggers 
       WHERE video_theme_id = $1 AND trigger_id = $2
       RETURNING *`,
      [themeId, triggerId]
    );
    return { success: res.rows.length > 0 };
  },
};
