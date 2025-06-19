"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const GenerateIdeaPage = () => {
  const [videoDuration, setVideoDuration] = useState(10);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [generatedTimeline, setGeneratedTimeline] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Пример списка доступных тем (можно заменить на загрузку из API)
  const [availableTopics, setAvailableTopics] = useState([]);
  const [error, setError] = useState(null);

  // Пример триггеров для тем (в реальном приложении нужно загружать из API)

  useEffect(() => {
    fetchTriggerTypes();
  }, []);
  const fetchTriggerTypes = async () => {
    try {
      const response = await fetch("/api/trigger_types");
      const data = await response.json();
      console.log("типы триггеров:", data);
      setAvailableTopics(data);
    } catch (err) {
      setError("Не удалось загрузить типы триггеров");
    }
  };

  const fetchTriggersByTheme = async (themeId) => {
    try {
      const response = await fetch(`/api/triggers/by_theme?themeId=${themeId}`);
      const data = await response.json();
      console.log("триггеры:", data);
      return(data);
    } catch (err) {
      setError("Не удалось загрузить триггеры");
    }
  };

  const toggleTopic = (topic) => {
    if (selectedTopics.some((t) => t.id === topic.id)) {
      setSelectedTopics(selectedTopics.filter((t) => t.id !== topic.id));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const generateTimeline = async () => {
    setIsGenerating(true);

    try {
      const triggersPerTopic = Math.floor(
        videoDuration / selectedTopics.length / 2.5
      );
      const timeline = [];

      for (let index = 0; index < selectedTopics.length; index++) {
        const topic = selectedTopics[index];
        const response = await fetchTriggersByTheme(topic.id);
        console.log("триггеры для темы:", topic.id, response);
        // Убедимся, что мы получили массив
        const topicTriggersList = response.map((item) => ({
              id: item.id || Math.random(), // Используем существующий ID или генерируем случайный
              name: item.trigger_type_name, // Используем trigger_type_name как название
              description: item.description || "Описание отсутствует", // Добавляем описание, если есть
            }));

        console.log(
          "Обработанные триггеры для темы:",
          topic.id,
          topicTriggersList
        );

        // Создаем копию массива перед сортировкой
        const shuffledTriggers = [...topicTriggersList].sort(
          () => 0.5 - Math.random()
        );
        const selectedTriggers = shuffledTriggers.slice(0, triggersPerTopic);

        const startTime = index * (videoDuration / selectedTopics.length);

        selectedTriggers.forEach((trigger, triggerIndex) => {
          const triggerStart = startTime + triggerIndex * 2.5;
          timeline.push({
            ...trigger,
            topic: topic.name,
            startTime: Math.min(triggerStart, videoDuration - 2.5),
            duration: 2.5,
          });
        });
      }

      setGeneratedTimeline(timeline.sort((a, b) => a.startTime - b.startTime));
    } catch (error) {
      console.error("Ошибка при генерации таймлайна:", error);
      setError("Не удалось сгенерировать таймлайн");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (minutes) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Назад
        </Link>
        <h1>Генератор идей для видео</h1>
      </header>

      <main className={styles.main}>
        <section className={styles.settingsSection}>
          <div className={styles.durationControl}>
            <label>
              Длительность видео (минут):
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={videoDuration}
                onChange={(e) => setVideoDuration(Number(e.target.value))}
              />
              <span>{videoDuration} мин</span>
            </label>
          </div>

          <div className={styles.topicsSelection}>
            <h2>Выберите темы</h2>
            <div className={styles.topicsGrid}>
              {availableTopics.map((topic) => (
                <button
                  key={topic.id}
                  className={`${styles.topicButton} ${
                    selectedTopics.some((t) => t.id === topic.id)
                      ? styles.selected
                      : ""
                  }`}
                  onClick={() => toggleTopic(topic)}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>

          <button
            className={styles.generateButton}
            onClick={generateTimeline}
            disabled={selectedTopics.length === 0 || isGenerating}
          >
            {isGenerating ? "Генерация..." : "Сгенерировать таймлайн"}
          </button>
        </section>

        {generatedTimeline && (
          <section className={styles.timelineSection}>
            <h2>Таймлайн видео</h2>
            <p>
              Длительность: {videoDuration} минут | Темы:{" "}
              {selectedTopics.length} | Триггеров: {generatedTimeline.length}
            </p>

            <div className={styles.timeline}>
              {generatedTimeline.map((item, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.timelineTime}>
                    {formatTime(item.startTime)} -{" "}
                    {formatTime(item.startTime + item.duration)}
                  </div>
                  <div className={styles.timelineContent}>
                    <h3>{item.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default GenerateIdeaPage;
