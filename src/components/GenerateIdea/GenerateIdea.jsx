"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./GenerateIdea.module.css";
import { useIdeaContext } from "@/lib/IdeaContext";

// Пример данных (замените на реальные из вашей БД)

const GenerateIdeaPage = () => {
  const router = useRouter();
  const [duration, setDuration] = useState(10); // минуты
  const [requiredTriggers, setRequiredTriggers] = useState([]);
  const [excludedTriggers, setExcludedTriggers] = useState([]);
  const [triggers, setTriggers] = useState([]); // Инициализируем как массив
  const { setIdeaParams } = useIdeaContext();

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

  // Обработчики выбора триггеров
  const toggleRequiredTrigger = (trigger) => {
    setRequiredTriggers((prev) =>
      prev.some((t) => t.id === trigger.id)
        ? prev.filter((t) => t.id !== trigger.id)
        : [...prev, trigger]
    );
  };

  const toggleExcludedTrigger = (trigger) => {
    setExcludedTriggers((prev) =>
      prev.some((t) => t.id === trigger.id)
        ? prev.filter((t) => t.id !== trigger.id)
        : [...prev, trigger]
    );
  };

  // Отправка формы
  const handleSubmit = (e) => {
    e.preventDefault();

    setIdeaParams({
      requiredTriggers,
      excludedTriggers,
      duration,
    });

    router.push("/generated_idea");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Настройка идеи</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Блок: Длительность */}
        <div className={styles.section}>
          <h2>Длительность видео</h2>
          <p>Выберите длительность (в минутах):</p>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.durationValue}>{duration} мин</span>
        </div>

        {/* Блок: Обязательные триггеры */}
        <div className={styles.section}>
          <h2>Обязательные триггеры</h2>
          <p>Выберите, что точно должно быть в видео:</p>
          <div className={styles.triggersGrid}>
            {triggers && triggers.map((trigger) => (
              <button
                key={trigger.id}
                type="button"
                className={`${styles.triggerButton} ${
                  requiredTriggers.some((t) => t.id === trigger.id)
                    ? styles.selected
                    : ""
                }`}
                onClick={() => toggleRequiredTrigger(trigger)}
              >
                {trigger.name} <span>({trigger.trigger_type_name})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Блок: Исключаемые триггеры */}
        <div className={styles.section}>
          <h2>Исключить триггеры</h2>
          <p>Выберите, чего не должно быть в видео:</p>
          <div className={styles.triggersGrid}>
            {triggers && triggers.map((trigger) => {
              const isRequired = requiredTriggers.some(
                (t) => t.id === trigger.id
              );
              const isExcluded = excludedTriggers.some(
                (t) => t.id === trigger.id
              );

              return (
                <button
                  key={trigger.id}
                  type="button"
                  className={`${styles.triggerButton} ${
                    isExcluded ? styles.selected : ""
                  } ${isRequired ? styles.disabled : ""}`}
                  onClick={() => !isRequired && toggleExcludedTrigger(trigger)}
                  disabled={isRequired}
                >
                  {trigger.name} <span>({trigger.trigger_type_name})</span>
                  {isRequired && (
                    <span className={styles.tooltip}>Уже в обязательных</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Сгенерировать идею
        </button>
      </form>
    </div>
  );
};

export default GenerateIdeaPage;
