"use client";

import { useEffect, useState } from "react";
import Header from "@/components/HomePage/Header";
import TriggerCard from "@/components/UI/TriggerCard";
import styles from "./page.module.css";
import Link from "next/link";
import AddTriggerForm from "@/components/AddTrigger/AddTriggerForm";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [showForm, setShowForm] = useState(false);
  const [triggers, setTriggers] = useState([]); // Инициализируем как массив
  const [categories, setCategories] = useState([]); // Инициализируем как массив
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTriggerTypes();
    fetchTriggers(); // Добавьте эту функцию для загрузки триггеров
  }, []);

  const fetchTriggerTypes = async () => {
    try {
      const response = await fetch("/api/trigger_types");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError("Не удалось загрузить типы триггеров");
    }
  };

  const fetchTriggers = async () => {
    try {
      const response = await fetch("/api/triggers");
      const data = await response.json();
      setTriggers(data);
    } catch (err) {
      setError("Не удалось загрузить триггеры");
    }
  };

  const filteredTriggers = triggers.filter((trigger) => {
    const matchesSearch =
      trigger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trigger.description &&
        trigger.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "Все" ||
      (trigger.trigger_type_id &&
        trigger.trigger_type_id === selectedCategory.id);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <Link href={"/generate_idea"}>
          <button className={styles.generateButton}>Сгенерировать идею</button>
        </Link>

        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Поиск триггеров..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className={styles.categories}>
            <button
              className={`${styles.categoryButton} ${
                selectedCategory === "Все" ? styles.active : ""
              }`}
              onClick={() => setSelectedCategory("Все")}
            >
              Все
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryButton} ${
                  selectedCategory === category ? styles.active : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <AddTriggerForm
            onClose={(success) => {
              setShowForm(false);
              if (success) {
                fetchTriggerTypes();
                fetchTriggers(); // Обновляем список триггеров
              }
            }}
          />
        )}

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.triggersGrid}>
          <button onClick={() => setShowForm(true)} className={styles.addTriggerCard}>
            Добавить триггер
          </button>

          {filteredTriggers.map((trigger) => (
            <TriggerCard
              key={trigger.id}
              name={trigger.name}
              description={trigger.description}
              category={trigger.trigger_type_name || "Без категории"}
              isFavorite={true}
            />
          ))}
        </div>
        <button
          className={styles.addTriggerButton}
          onClick={() => setShowForm(true)}
        >
          Добавить триггер
        </button>
      </main>
    </div>
  );
};

export default Home;
