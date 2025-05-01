import React from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import styles from './Header.module.css';

const Header = ({ onProfileClick }) => {
  return (
    <header className={styles.header}>
      <div className={styles.userInfo}>
        <FaBell 
          className={`${styles.icon} ${styles.bellIcon}`} 
          title="Уведомления"
          aria-label="Уведомления"
        />
        <FaUserCircle 
          className={`${styles.icon} ${styles.avatar}`}
          title="Аватар пользователя"
          aria-label="Аватар пользователя"
          onClick={onProfileClick}
          style={{ cursor: 'pointer' }}
        />
      </div>
    </header>
  );
};

export default Header;