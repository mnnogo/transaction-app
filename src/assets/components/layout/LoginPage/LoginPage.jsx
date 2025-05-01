import React from 'react';
import WelcomeSection from '../WelcomeSection/WelcomeSection';
import LoginForm from '../LoginForm/LoginForm';
import styles from './LoginPage.module.css';

const LoginPage = ({ setIsAuthenticated }) => {
  return (
    <div className={styles.container}>
      <WelcomeSection />
      <div className={styles.rightSection}>
        <LoginForm setIsAuthenticated={setIsAuthenticated} />
      </div>
    </div>
  );
};

export default LoginPage;