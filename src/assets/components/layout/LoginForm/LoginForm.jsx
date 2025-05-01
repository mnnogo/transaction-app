import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';

const LoginForm = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Упрощенная валидация email без флага 'v'
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Проверка заполненности полей
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    // Валидация email
    if (!validateEmail(email)) {
      setError('Пожалуйста, введите корректный email');
      return;
    }

    // Проверка длины пароля
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);

    // Имитация асинхронного запроса
    setTimeout(() => {
      setIsLoading(false);
      
      // В реальном приложении здесь будет запрос к серверу
      // Сейчас просто проверяем валидность формы
      if (validateEmail(email) && password.length >= 6) {
        setIsAuthenticated(true);
        localStorage.setItem('authToken', 'fake-token-' + Date.now());
        navigate('/dashboard');
      } else {
        setError('Форма заполнена неверно');
      }
    }, 1000);
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Вход в аккаунт</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="example@gmail.com"
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="••••••••"
            minLength="6"
          />
        </div>
        
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;