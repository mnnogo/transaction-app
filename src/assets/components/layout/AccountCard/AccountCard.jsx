import React from 'react';
import styles from './AccountCard.module.css';

const AccountCard = ({ accountName, balance }) => {
  return (
    <div className={styles.accountCard}>
      <span className={styles.accountName}>{accountName}</span>
      <strong className={styles.balance}>{balance}</strong>
    </div>
  );
};

export default AccountCard;