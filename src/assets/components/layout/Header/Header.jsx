import React, { useState, useEffect } from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import styles from './Header.module.css';

const Header = ({ onProfileClick }) => {
  const [userPhoto, setUserPhoto] = useState(null);
  const email = localStorage.getItem('email');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/user?email=${email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        if (data.photo) {
          // конвертируем Base64 в URL для изображения
          const photoUrl = `data:image/jpeg;base64,${data.photo}`;
          setUserPhoto(photoUrl);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      }
    };

    fetchUserData();
  }, [email]);

  return (
    <header className={styles.header}>
      <div className={styles.userInfo}>
        <FaBell 
          className={`${styles.icon} ${styles.bellIcon}`} 
          title="Уведомления"
          aria-label="Уведомления"
        />
        {userPhoto ? (
          <img 
            src={userPhoto} 
            alt="Аватар пользователя" 
            className={`${styles.icon} ${styles.avatar}`}
            onClick={onProfileClick}
            style={{ cursor: 'pointer' }}
          />
        ) : (
          <FaUserCircle 
            className={`${styles.icon} ${styles.avatar}`}
            title="Аватар пользователя"
            aria-label="Аватар пользователя"
            onClick={onProfileClick}
            style={{ cursor: 'pointer' }}
          />
        )}
      </div>
    </header>
  );
};

export default Header;