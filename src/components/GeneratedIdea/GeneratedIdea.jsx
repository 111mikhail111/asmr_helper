"use client";

import { useState, useEffect } from "react";
import styles from "./GeneratedIdea.module.css";
import { useIdeaContext } from "@/lib/IdeaContext";
import { useUser } from "@/lib/UserContext";

const GeneratedIdeaPage = () => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [error, setError] = useState(null);
  const { ideaParams } = useIdeaContext();
  const { requiredTriggers, excludedTriggers, duration } = ideaParams;
  const [triggers, setTriggers] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canSaveTheme = generatedIdea?.triggers?.length > 0;
  const { asmruser } = useUser();

  useEffect(() => {
    fetchTriggers(); // Добавьте эту функцию для загрузки триггеров
  }, []);

  const fetchTriggers = async () => {
    try {
      const response = await fetch("/api/triggers");
      const data = await response.json();
      setTriggers(data);
      console.log(data);
    } catch (err) {
      setError("Не удалось загрузить триггеры");
    }
  };

  useEffect(() => {
    const checkIfFavorite = async () => {
      if (generatedIdea && asmruser) {
        try {
          const response = await fetch(
            `/api/users/${asmruser.id}/favorites/themes`
          );
          const data = await response.json();
          // Убедимся, что работаем с массивом
          const favorites = Array.isArray(data) ? data : [];
          const isFav = favorites.some(
            (fav) => fav.name === generatedIdea.title
          );
          setIsFavorite(isFav);
        } catch (error) {
          console.error("Ошибка проверки избранного:", error);
        }
      }
    };

    checkIfFavorite();
  }, [generatedIdea, asmruser]);

  useEffect(() => {
    if (triggers && !hasFetched) fetchIdea();
  }, [triggers, hasFetched]);

  const fetchIdea = async () => {
    try {
      setIsLoading(true);
      setError(null); // Сбрасываем ошибку перед новым запросом

      const response = await fetch("/api/generate-asmr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          triggers: triggers,
          req: requiredTriggers,
          ex: excludedTriggers,
          duration: duration,
        }),
      });

      // Проверяем статус ответа
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const apiResponse = await response.json();

      // Форматируем ответ (можно добавить дополнительную проверку данных)
      const formattedIdea = {
        title: apiResponse.title || "Название не указано",
        duration: apiResponse.duration || duration, // Используем переданную длительность по умолчанию
        triggers:
          apiResponse.triggers?.map((trigger, index) => ({
            timecode: trigger.timecode || formatTimecode(index * 2.5), // Форматируем время автоматически
            name: trigger.name || `Триггер ${index + 1}`,
            duration: trigger.duration || 150, // Средняя длительность 2.5 минуты
          })) || [],
      };

      setGeneratedIdea(formattedIdea);
      setHasFetched(true);
    } catch (err) {
      console.error("Ошибка при загрузке идеи:", err);
      setError("Не удалось загрузить данные. Показан пример сценария.");

      // Заглушка на случай ошибки
      setGeneratedIdea({
        title: "Уютная библиотека вечером",
        duration: duration, // Используем выбранную пользователем длительность
        triggers: generateFallbackTriggers(duration), // Генерируем триггеры по длительности
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Вспомогательная функция для генерации заглушки
  const generateFallbackTriggers = (duration) => {
    const triggerCount = Math.floor(duration / 2.5); // Примерно 2.5 минуты на триггер
    return Array.from({ length: Math.max(1, triggerCount) }, (_, i) => ({
      timecode: formatTimecode(i * 2.5),
      name: ["Шёпот", "Перелистывание книги", "Скрежет пера", "Шум страниц"][
        i % 4
      ],
      duration: 150,
    }));
  };

  // Форматирование времени (минуты:секунды)
  const formatTimecode = (minutes) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddToFavorites = async () => {
    setIsSaving(true);
    try {
      if (!generatedIdea) {
        throw new Error("Нет данных для сохранения");
      }

      if (!asmruser) {
        throw new Error("Необходимо авторизоваться");
      }

      // 1. Сохраняем тему
      const themeResponse = await fetch("/api/video_themes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: generatedIdea.title,
          duration: generatedIdea.duration,
        }),
      });

      if (!themeResponse.ok) {
        const errorData = await themeResponse.json();
        throw new Error(errorData.error || "Ошибка сохранения темы");
      }

      const themeData = await themeResponse.json();

      // 2. Сохраняем триггеры темы
      const triggersResponse = await fetch("/api/video_themes/triggers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          themeId: themeData.id,
          triggers: generatedIdea.triggers,
        }),
      });

      if (!triggersResponse.ok) {
        const errorData = await triggersResponse.json();
        throw new Error(errorData.error || "Ошибка сохранения триггеров темы");
      }

      // 3. Добавляем в избранное пользователя
      const favoriteResponse = await fetch(
        `/api/users/${asmruser.id}/favorites/themes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: asmruser.id,
            themeId: themeData.id,
          }),
        }
      );

      if (!favoriteResponse.ok) {
        const errorData = await favoriteResponse.json();
        throw new Error(errorData.error || "Ошибка добавления в избранное");
      }

      setIsFavorite(true);
      alert("Тема и триггеры успешно сохранены в избранное!");
    } catch (err) {
      console.error("Ошибка при сохранении:", err);
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Генерируем идею для вашего видео...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <p>Используется демо-версия данных</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Ваша идея для видео</h1>
        <button
          onClick={handleAddToFavorites}
          disabled={isFavorite || isSaving || !canSaveTheme}
          className={`${styles.favoriteButton} ${
            isFavorite ? styles.favorited : ""
          }`}
        >
          {isSaving
            ? "Сохранение..."
            : isFavorite
            ? "★ В избранном"
            : "☆ Добавить в избранные темы"}
        </button>
      </div>

      <div className={styles.ideaCard}>
        <h2 className={styles.ideaTitle}>{generatedIdea.title}</h2>
        <p className={styles.duration}>
          Длительность: {generatedIdea.duration} минут
        </p>

        <div className={styles.timeline}>
          <h3>Таймлайн видео:</h3>
          <ul className={styles.timelineList}>
            {generatedIdea.triggers.map((trigger, index) => (
              <li key={index} className={styles.timelineItem}>
                <span className={styles.timecode}>{trigger.timecode}</span>
                <span className={styles.triggerName}>{trigger.name}</span>
                <span className={styles.triggerDuration}>
                  ({trigger.duration} сек)
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.triggersList}>
          <h3>Все триггеры в теме:</h3>
          <div className={styles.triggersGrid}>
            {generatedIdea.triggers.map((trigger, index) => (
              <div key={index} className={styles.triggerBadge}>
                {trigger.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      <button className={styles.againBtn} onClick={() => fetchIdea()}>
        Сгенерировать заново
      </button>
    </div>
  );
};

export default GeneratedIdeaPage;
