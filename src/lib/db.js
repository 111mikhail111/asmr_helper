import Database from "better-sqlite3";
import path from "path";

// Инициализация БД (файл будет создан в корне проекта как `asmr.db`)
const dbPath = path.join(process.cwd(), "asmr.db");
const db = new Database(dbPath, { verbose: console.log }); // Логирование запросов

// Создаём таблицы (если их нет)
function initDB() {
  // 1. Вид триггера (категория: звук, визуал, тактильный и т.д.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS trigger_type (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );
  `);

  // 2. Триггер (конкретный триггер: "шёпот", "перелистывание книги" и т.д.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS trigger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      audio_file_path TEXT,
      trigger_type_id INTEGER,
      FOREIGN KEY (trigger_type_id) REFERENCES trigger_type(id)
    );
  `);

  // 3. Тема для видео (например, "Библиотека", "Дождь в лесу")
  db.exec(`
    CREATE TABLE IF NOT EXISTS video_theme (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      background_image_path TEXT,
      duration INTEGER
    );
  `);

  // 4. Связь триггеров и тем (многие-ко-многим)
  db.exec(`
    CREATE TABLE IF NOT EXISTS video_theme_triggers (
      video_theme_id INTEGER,
      trigger_id INTEGER,
      timecode TEXT,
      duration INTEGER,
      PRIMARY KEY (video_theme_id, trigger_id),
      FOREIGN KEY (video_theme_id) REFERENCES video_theme(id),
      FOREIGN KEY (trigger_id) REFERENCES trigger(id)
    );
  `);

  // 5. Пользователь
  db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );
  `);

  // 6. Избранные триггеры пользователя (многие-ко-многим)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_favorite_triggers (
      user_id INTEGER,
      trigger_id INTEGER,
      PRIMARY KEY (user_id, trigger_id),
      FOREIGN KEY (user_id) REFERENCES user(id),
      FOREIGN KEY (trigger_id) REFERENCES trigger(id)
    );
  `);

  // 7. Избранные темы пользователя (многие-ко-многим)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_favorite_themes (
      user_id INTEGER,
      video_theme_id INTEGER,
      PRIMARY KEY (user_id, video_theme_id),
      FOREIGN KEY (user_id) REFERENCES user(id),
      FOREIGN KEY (video_theme_id) REFERENCES video_theme(id)
    );
  `);
}

// Инициализируем БД при первом подключении
initDB();

// Экспортируем методы для работы с БД
export default {
  // Пример метода для добавления триггера
  addTrigger: (name, description, triggerTypeId, audio_path = null) => {
    const stmt = db.prepare(`
      INSERT INTO trigger (name, description, trigger_type_id, audio_file_path)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(name, description, triggerTypeId, audio_path);
  },

  addTriggerType: (name, description) => {
    const stmt = db.prepare(`
      INSERT INTO trigger_type (name, description)
      VALUES (?, ?)
    `);
    return stmt.run(name, description);
  },

  // Получить все триггеры
  getAllTriggers: () => {
    return db
      .prepare(
        `
      SELECT t.*, tt.name AS trigger_type_name 
      FROM trigger t
      LEFT JOIN trigger_type tt ON t.trigger_type_id = tt.id
    `
      )
      .all();
  },

  getAllTriggerTypes: () => {
    return db
      .prepare(
        `
      SELECT * 
      FROM trigger_type
    `
      )
      .all();
  },

  // Добавить пользователя
  addUser: (username, email, passwordHash) => {
    const stmt = db.prepare(`
    INSERT INTO user (username, email, password_hash, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `);
    const result = stmt.run(username, email, passwordHash);

    // Возвращаем созданного пользователя
    return db
      .prepare("SELECT * FROM user WHERE id = ?")
      .get(result.lastInsertRowid);
  },

  // Проверка существования пользователя по email
  getUserByEmail: (email) => {
    return db.prepare("SELECT * FROM user WHERE email = ?").get(email);
  },

  // Добавить триггер в избранное пользователя
  addFavoriteTrigger: (userId, triggerId) => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO user_favorite_triggers (user_id, trigger_id)
      VALUES (?, ?)
    `);
    return stmt.run(userId, triggerId);
  },

  // ... другие методы по необходимости
};

export const favoriteThemesService = {
  getFavoriteThemesByUserId: (userId) => {
    if (!userId || isNaN(userId)) {
      throw new Error("Неверный ID пользователя");
    }

    const query = `
      SELECT vt.* 
      FROM user_favorite_themes uft
      JOIN video_theme vt ON uft.video_theme_id = vt.id
      WHERE uft.user_id = ?
    `;

    return db.prepare(query).all(userId);
  },

  addFavoriteTheme: (userId, themeId) => {
    // Проверяем существование записи
    const existingFavorite = db
      .prepare(
        `
      SELECT 1 FROM user_favorite_themes 
      WHERE user_id = ? AND video_theme_id = ?
    `
      )
      .get(userId, themeId);

    if (existingFavorite) {
      return { success: false, message: "Тема уже в избранном" };
    }

    // Добавляем в избранное
    db.prepare(
      `
      INSERT INTO user_favorite_themes (user_id, video_theme_id)
      VALUES (?, ?)
    `
    ).run(userId, themeId);

    return { success: true };
  },

  removeFavoriteTheme: (userId, themeId) => {
    const stmt = db.prepare(`
      DELETE FROM user_favorite_themes
      WHERE user_id = ? AND video_theme_id = ?
    `);
    return stmt.run(userId, themeId);
  },
};

export const videoThemeService = {
  // Получить все темы
  getAllThemes: () => {
    return db.prepare("SELECT * FROM video_theme").all();
  },

  // Найти тему по имени
  getThemeByName: (name) => {
    return db.prepare("SELECT * FROM video_theme WHERE name = ?").get(name);
  },

  // Создать новую тему
  createTheme: (name, duration) => {
    const stmt = db.prepare(`
      INSERT INTO video_theme (name, duration)
      VALUES (?, ?)
    `);
    const result = stmt.run(name, duration);

    return db
      .prepare("SELECT * FROM video_theme WHERE id = ?")
      .get(result.lastInsertRowid);
  },

  // Дополнительные методы по работе с темами
  getThemeById: (id) => {
    return db.prepare("SELECT * FROM video_theme WHERE id = ?").get(id);
  },

  updateTheme: (id, updates) => {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);
    values.push(id); // Добавляем id в конец для WHERE

    const stmt = db.prepare(`
      UPDATE video_theme
      SET ${fields}
      WHERE id = ?
    `);
    stmt.run(...values);

    return videoThemeService.getThemeById(id);
  },

  deleteTheme: (id) => {
    return db.prepare("DELETE FROM video_theme WHERE id = ?").run(id);
  },

  getThemeWithTriggers: (themeId) => {
    // Получаем основную информацию о теме
    const theme = db
      .prepare(
        `
      SELECT id, name AS title, duration 
      FROM video_theme 
      WHERE id = ?
    `
      )
      .get(themeId);

    if (!theme) {
      throw new Error("Тема не найдена");
    }

    // Получаем все триггеры для темы
    const triggers = db
      .prepare(
        `
      SELECT 
        t.name,
        vtt.timecode,
        vtt.duration
      FROM video_theme_triggers vtt
      JOIN trigger t ON vtt.trigger_id = t.id
      WHERE vtt.video_theme_id = ?
      ORDER BY vtt.timecode
    `
      )
      .all(themeId);

    // Форматируем результат
    return {
      title: theme.title,
      duration: theme.duration,
      triggers: triggers.map((trigger) => ({
        timecode: trigger.timecode,
        name: trigger.name,
        duration: trigger.duration,
      })),
    };
  },
};

export const videoThemeTriggersService = {
  // Получить триггеры по ID темы
  getTriggersByThemeId: (themeId) => {
    return db
      .prepare(
        `
      SELECT t.*, vtt.timecode, vtt.duration
      FROM video_theme_triggers vtt
      JOIN trigger t ON vtt.trigger_id = t.id
      WHERE vtt.video_theme_id = ?
    `
      )
      .all(themeId);
  },

  // Найти триггер по имени
  getTriggerByName: (name) => {
    return db.prepare("SELECT id FROM trigger WHERE name = ?").get(name);
  },

  // Обновить триггеры для темы (полная замена)
  updateThemeTriggers: (themeId, triggers) => {
    // Получаем ID триггеров по их именам
    const triggerIds = triggers.map((trigger) => {
      const result = db
        .prepare("SELECT id FROM trigger WHERE name = ?")
        .get(trigger.name);

      if (!result) {
        throw new Error(`Триггер '${trigger.name}' не найден`);
      }
      return {
        id: result.id,
        timecode: trigger.timecode,
        duration: trigger.duration,
      };
    });

    // Удаляем старые триггеры темы
    db.prepare("DELETE FROM video_theme_triggers WHERE video_theme_id = ?").run(
      themeId
    );

    // Сохраняем новые триггеры темы
    const stmt = db.prepare(`
      INSERT INTO video_theme_triggers 
      (video_theme_id, trigger_id, timecode, duration)
      VALUES (?, ?, ?, ?)
    `);

    db.transaction(() => {
      triggerIds.forEach(({ id, timecode, duration }) => {
        stmt.run(themeId, id, timecode, duration);
      });
    })();

    return { success: true, count: triggerIds.length };
  },

  // Добавить один триггер к теме
  addTriggerToTheme: (themeId, triggerId, timecode, duration) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO video_theme_triggers 
      (video_theme_id, trigger_id, timecode, duration)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(themeId, triggerId, timecode, duration);
  },

  // Удалить триггер из темы
  removeTriggerFromTheme: (themeId, triggerId) => {
    return db
      .prepare(
        `
      DELETE FROM video_theme_triggers 
      WHERE video_theme_id = ? AND trigger_id = ?
    `
      )
      .run(themeId, triggerId);
  },
};
