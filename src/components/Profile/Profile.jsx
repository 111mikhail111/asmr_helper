"use client";
import { useUser } from "@/lib/UserContext";
import styles from "./Profile.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { asmruser, setAsmruser } = useUser();
  const [favoriteThemes, setFavoriteThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    setAsmruser(null);
    router.push("/");
  };

  useEffect(() => {
    if (asmruser?.id) {
      fetchFavoriteThemes();
    }
  }, [asmruser]);

  const fetchFavoriteThemes = async () => {
    try {
      const response = await fetch(
        `/api/users/${asmruser.id}/favorites/themes`
      );
      const data = await response.json();
      setFavoriteThemes(data);
    } catch (error) {
      console.error("Ошибка загрузки избранных тем:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!asmruser) {
    return (
      <div className={styles.container}>
        <h1>Профиль</h1>
        <p>Пожалуйста, войдите в систему</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarPlaceholder}>
            {asmruser.username.charAt(0).toUpperCase()}
          </div>
          <h1>{asmruser.username}</h1>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email:</span>
            <span>{asmruser.email}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Дата регистрации:</span>
            <span>{new Date(asmruser.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Выйти
        </button>
      </div>

      <section className={styles.favoritesSection}>
        <h2>Избранные темы</h2>

        {isLoading ? (
          <p>Загрузка...</p>
        ) : favoriteThemes.length > 0 ? (
          <div className={styles.themesGrid}>
            {favoriteThemes.map((theme) => (
              <div key={theme.id} className={styles.themeCard}>
                <Link href={`/theme/${theme.id}`}>
                  <h3>{theme.name}</h3>
                  <p>{theme.description}</p>
                  <div className={styles.themeMeta}>
                    <span>Длительность: {theme.duration} мин</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.nothemes}>У вас пока нет избранных тем</p>
        )}
      </section>
    </div>
  );
}
