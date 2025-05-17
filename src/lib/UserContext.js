// src/lib/UserContext.js
'use client'
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [asmruser, setAsmruser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('asmruser');
    setIsLoading(false);
    // Проверяем на null и пустую строку
    if (savedUser && savedUser !== 'undefined') {
      try {
        setAsmruser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Ошибка при парсинге пользователя:', error);
        localStorage.removeItem('asmruser'); // Удаляем битые данные
      }
    }
  }, []);

  const updateUser = (newUser) => {
    setAsmruser(newUser);
    localStorage.setItem('asmruser', JSON.stringify(newUser));
  };

  const updateUserImage = (imagePath) => {
    // Создаем обновленного пользователя с новым avatar
    const updatedUser = {
      ...asmruser,  // Копируем все существующие данные пользователя
      avatar: imagePath  // Обновляем только avatar
    };
  
    // Обновляем состояние
    setAsmruser(updatedUser);
    
    // Сохраняем в localStorage
    localStorage.setItem('asmruser', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{ asmruser, setAsmruser: updateUser, isLoading, updateUserImage }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};