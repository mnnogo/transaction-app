import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiKey } from 'react-icons/fi';
import styles from './ProfilePage.module.css';

const ProfilePage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const userData = {
    name: "Иванов Иван",
    email: "mail@mail.ru",
    phone: "+7 000 000 00 00",
    gender: "Мужской",
    avatar: "/images/avatar.jpg"
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handlePasswordReset = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.avatarContainer}>
          <img src={userData.avatar} alt="Avatar" className={styles.avatar} />
          <button className={styles.editIcon}>
            <FiEdit size={12} />
          </button>
        </div>
        <h2>{userData.name}</h2>

        <div className={styles.infoBlock}>
          <span>Email</span>
          <p>{userData.email}</p>
        </div>

        <div className={styles.infoBlock}>
          <span>Номер телефона</span>
          <p>{userData.phone}</p>
        </div>

        <div className={styles.infoBlock}>
          <span>Пол</span>
          <p>{userData.gender}</p>
        </div>

        <div className={styles.actionButtons}>
          <button 
            onClick={handleBackToDashboard} 
            className={styles.actionButton}
          >
            <FiArrowLeft className={styles.buttonIcon} />
            Назад
          </button>
          
          <button 
            onClick={handlePasswordReset} 
            className={styles.actionButton}
          >
            <FiKey className={styles.buttonIcon} />
            Сброс пароля
          </button>
        </div>
      </div>

      <button onClick={handleLogout} className={styles.logoutLink}>
        <FiArrowLeft className={styles.arrowIcon} size={15} />
        <span>Выйти</span>
      </button>
    </div>
  );
};

export default ProfilePage;