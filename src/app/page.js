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
  const [showAddForm, setShowAddForm] = useState(false); // Renamed for clarity
  const [showEditForm, setShowEditForm] = useState(false); // New state for edit form
  const [editingTrigger, setEditingTrigger] = useState(null); // New state for trigger being edited
  const [triggers, setTriggers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // New state for delete confirmation
  const [triggerToDelete, setTriggerToDelete] = useState(null); // New state for trigger to delete

  useEffect(() => {
    fetchTriggerTypes();
    fetchTriggers();
  }, []);

  const fetchTriggerTypes = async () => {
    try {
      const response = await fetch("/api/trigger_types");
      const data = await response.json();
      console.log('типы триггеров:', data)
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

  const handleDeleteTrigger = async (id) => {
    try {
      const response = await fetch("/api/triggers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete trigger");

      fetchTriggers(); // Refresh the list of triggers
      setShowDeleteConfirm(false); // Close confirmation
      setTriggerToDelete(null); // Clear trigger to delete
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditTrigger = (trigger) => {
    setEditingTrigger(trigger);
    setShowEditForm(true);
  };

  const handleCloseAddForm = (success) => {
    setShowAddForm(false);
    if (success) {
      fetchTriggerTypes();
      fetchTriggers();
    }
  };

  const handleCloseEditForm = (success) => {
    setShowEditForm(false);
    setEditingTrigger(null);
    if (success) {
      fetchTriggers();
    }
  };

  const filteredTriggers = triggers
    ? triggers.filter((trigger) => {
        const matchesSearch =
          trigger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (trigger.description &&
            trigger.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()));
        const matchesCategory =
          selectedCategory === "Все" ||
          (trigger.trigger_type_id &&
            trigger.trigger_type_id === selectedCategory.id);
        return matchesSearch && matchesCategory;
      })
    : triggers;

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <Link href={"/generate_from_themes"}>
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
            {categories && categories.map((category) => (
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

        {showAddForm && (
          <AddTriggerForm
            onClose={handleCloseAddForm}
          />
        )}

        {showEditForm && editingTrigger && (
          <AddTriggerForm // Reuse AddTriggerForm for editing
            onClose={handleCloseEditForm}
            initialData={editingTrigger} // Pass existing trigger data for editing
          />
        )}

        {showDeleteConfirm && triggerToDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>Подтверждение удаления</h2>
              <p>Вы уверены, что хотите удалить триггер {triggerToDelete.name}?</p>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTriggerToDelete(null);
                  }}
                >
                  Отмена
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteTrigger(triggerToDelete.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.triggersGrid}>
          <button
            onClick={() => setShowAddForm(true)}
            className={styles.addTriggerCard}
          >
            Добавить триггер
          </button>

          {filteredTriggers.map((trigger) => (
            <TriggerCard
              key={trigger.id}
              name={trigger.name}
              description={trigger.description}
              category={categories.find(cat => cat.id === trigger.trigger_type_id)?.name || "Без категории"}
              isFavorite={true}
              onEdit={() => handleEditTrigger(trigger)} // Pass edit handler
              onDelete={() => { // Pass delete handler
                setTriggerToDelete(trigger);
                setShowDeleteConfirm(true);
              }}
            />
          ))}
        </div>
        <button
          className={styles.addTriggerButton}
          onClick={() => setShowAddForm(true)}
        >
          Добавить триггер
        </button>
      </main>
    </div>
  );
};

export default Home;