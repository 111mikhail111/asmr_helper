// components/UI/TriggerCard.jsx
import React from "react";
import styles from "./TriggerCard.module.css";

const TriggerCard = ({
  name,
  description,
  category,
  isFavorite,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.category}>{category}</span>
          <h3 className={styles.name}>{name}</h3>
        </div>
        {isFavorite && <span className={styles.favorite}>★</span>}
      </div>
      <p className={styles.description}>{description}</p>
      <div className={styles.actions}>
        <button onClick={onEdit} className={styles.editButton}>
          Редактировать
        </button>
        <button onClick={onDelete} className={styles.deleteButton}>
          Удалить
        </button>
      </div>
    </div>
  );
};

export default TriggerCard;