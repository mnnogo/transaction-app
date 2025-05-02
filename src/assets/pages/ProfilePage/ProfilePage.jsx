import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiKey } from 'react-icons/fi';
import styles from './ProfilePage.module.css';

const ProfilePage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
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
          data.photo = `data:image/jpeg;base64,${data.photo}`;
        }
        setUserData(data);
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      }
    };

    fetchUserData();
  }, [email]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handlePasswordReset = () => {
    setIsAuthenticated(false);
    localStorage.clear();
    navigate('/');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.clear();
    navigate('/');
  };

  if (!userData) {
    return <div className={styles.container}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.avatarContainer}>
          <img src={userData.photo} alt="Avatar" className={styles.avatar} />
          <button className={styles.editIcon}>
            <FiEdit size={12} />
          </button>
        </div>
        <h2>{userData.username}</h2>

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