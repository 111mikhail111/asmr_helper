"use client";
import { useState } from "react";
import styles from "./AuthForm.module.css";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegistrForm";

export default function AuthForm({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={styles.authContainer}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${isLogin ? styles.active : ""}`}
          onClick={() => setIsLogin(true)}
        >
          Вход
        </button>
        <button
          className={`${styles.tab} ${!isLogin ? styles.active : ""}`}
          onClick={() => setIsLogin(false)}
        >
          Регистрация
        </button>
      </div>

      {isLogin ? 
        <LoginForm onSuccess={onSuccess} /> : 
        <RegisterForm onSuccess={onSuccess} />
      }
    </div>
  );
}
