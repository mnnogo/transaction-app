import React from 'react';
import styles from './WelcomeSection.module.css';

const WelcomeSection = () => {
  return (
    <div className={styles.leftSection}>
      <h1 className={styles.title}>Здравствуйте!</h1>
      <p className={styles.subtitle}>Посмотрите детали вашего счета</p>
    </div>
  );
};

export default WelcomeSection;