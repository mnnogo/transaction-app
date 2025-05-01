import React from 'react';
import styles from './OverviewCard.module.css';

const OverviewCard = ({ title, amount }) => {
  return (
    <div className={styles.card}>
      <span className={styles.title}>{title}</span>
      <strong className={styles.amount}>{amount}</strong>
    </div>
  );
};

export default OverviewCard;