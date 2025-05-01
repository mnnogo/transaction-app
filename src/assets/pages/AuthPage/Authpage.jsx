import React from 'react';
import LoginPage from '../../components/layout/LoginPage/LoginPage';
import styles from './AuthPage.module.css';

const AuthPage = ({ setIsAuthenticated }) => {
  return (
    <div className={styles.authContainer}>
      <div className={styles.contentWrapper}>
        <LoginPage setIsAuthenticated={setIsAuthenticated} />
      </div>
    </div>
  );
};

export default AuthPage;