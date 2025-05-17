import styles from "./TriggerCard.module.css";

const TriggerCard = ({ name, description, category, isFavorite }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.category}>{category}</span>
        <button className={styles.favoriteButton}>
          {isFavorite ? "★" : "☆"}
        </button>
      </div>
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
};

export default TriggerCard;
