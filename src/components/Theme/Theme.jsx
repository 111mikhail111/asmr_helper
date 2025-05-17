import { use, useEffect, useState } from "react";
import styles from "./Theme.module.css";
import { useUser } from "@/lib/UserContext";

export default function Theme({ themeId }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const canSaveTheme = generatedIdea?.triggers?.length > 0;
  const {asmruser} = useUser();

  useEffect(() => {
    const fetchTheme = async () => {
      if (themeId != null) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/video_themes/${themeId}`);

          // Проверяем статус ответа
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Парсим JSON из ответа
          const data = await response.json();
          setGeneratedIdea(data);
        } catch (error) {
          console.error("Ошибка при загрузке темы:", error);
          // Можно добавить обработку ошибки (например, показать уведомление)
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTheme();
  }, [themeId]);

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

  const handleAddToFavorites = () => {alert('Функция "убрать из избранного" появиться позже')};

  if (isLoading) return <div>Загрузка темы...</div>;

  return (
    <>
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
      </div>
    </>
  );
}
