"use client";

import { useState } from "react";
import styles from "./Header.module.css";
import { useUser } from "@/lib/UserContext";
import AuthForm from "../Authorization/AuthForm";
import AuthModal from "../Authorization/AuthModal";
import Link from "next/link";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { asmruser } = useUser();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <header className={styles.header}>
      <Link href={"/"}>
        <div className={styles.logo}>ASMR Helper</div>
      </Link>
      <div className={styles.profile}>
        <button
          className={styles.profileButton}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Профиль
        </button>
        {isDropdownOpen && (
          <div className={styles.dropdown}>
            {asmruser ? (
              <>
                <a href="/profile">Страница профиля</a>
                <a href="/favorites/triggers">Избранные триггеры</a>
                <a href="/favorites/themes">Избранные темы</a>
              </>
            ) : (
              <>
                <button onClick={() => setIsAuthOpen(true)}>Войти</button>
                <button>Зарегистрироваться</button>
              </>
            )}
          </div>
        )}
      </div>
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </header>
  );
};

export default Header;
