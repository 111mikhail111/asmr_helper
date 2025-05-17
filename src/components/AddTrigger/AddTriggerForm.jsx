"use client";

import { useState, useEffect } from "react";
import styles from "./AddTriggerForm.module.css";

const AddTriggerForm = ({ onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [triggerTypeId, setTriggerTypeId] = useState("");
  const [triggerTypes, setTriggerTypes] = useState([]);
  const [error, setError] = useState("");
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDescription, setNewTypeDescription] = useState("");

  // Загружаем типы триггеров при монтировании
  useEffect(() => {
    fetchTriggerTypes();
  }, []);

  const fetchTriggerTypes = async () => {
    try {
      const response = await fetch("/api/trigger_types");
      const data = await response.json();
      setTriggerTypes(data);
    } catch (err) {
      setError("Failed to load trigger types");
    }
  };

  const addTriggerType = async () => {
    try {
      const response = await fetch("/api/trigger_types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTypeName,
          description: newTypeDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to add trigger type");

      // Обновляем список типов
      await fetchTriggerTypes();
      setShowAddTypeModal(false);
      setNewTypeName("");
      setNewTypeDescription("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/triggers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          triggerTypeId,
          audioFile,
        }),
      });

      if (!response.ok) throw new Error("Failed to add trigger");

      onClose(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={() => onClose(false)}>
          ×
        </button>

        <h2>Добавить новый триггер</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>
              Название триггера*:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                required
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>
              Тип триггера*:
              <div className={styles.typeSelector}>
                <select
                  value={triggerTypeId}
                  onChange={(e) => setTriggerTypeId(e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="">Выберите тип</option>
                  {triggerTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.addTypeButton}
                  onClick={() => setShowAddTypeModal(true)}
                >
                  +
                </button>
              </div>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>
              Описание:
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
              />
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>
              Аудиофайл:
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setAudioFile(file ? file.name : null); // Сохраняем только имя файла
                }}
                className={styles.fileInput}
              />
            </label>
            {audioFile && <p>Выбран файл: {audioFile}</p>}
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => onClose(false)}
              className={styles.cancelButton}
            >
              Отмена
            </button>
            <button type="submit" className={styles.submitButton}>
              Добавить
            </button>
          </div>
        </form>

        {/* Модальное окно для добавления нового типа */}
        {showAddTypeModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                className={styles.closeButton}
                onClick={() => setShowAddTypeModal(false)}
              >
                ×
              </button>

              <h2>Добавить новый тип триггера</h2>

              <div className={styles.form}>
                <div className={styles.formGroup}>
                  <label>
                    Название типа*:
                    <input
                      type="text"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      className={styles.input}
                      required
                    />
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Описание:
                    <textarea
                      value={newTypeDescription}
                      onChange={(e) => setNewTypeDescription(e.target.value)}
                      className={styles.textarea}
                    />
                  </label>
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    onClick={() => setShowAddTypeModal(false)}
                    className={styles.cancelButton}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={addTriggerType}
                    className={styles.submitButton}
                    disabled={!newTypeName}
                  >
                    Добавить тип
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTriggerForm;
