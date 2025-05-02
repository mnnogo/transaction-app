import React from 'react';
import styles from './AccountCard.module.css';

const AccountCard = ({ accountId, name, balance, onClick, isSelected }) => {
  return (
    <div 
      className={`${styles.accountCard} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.accountHeader}>
        <h3 className={styles.accountName}>{name}</h3>
        <div className={styles.accountId}>{accountId}</div>
      </div>
      <div className={styles.accountBalance}>{balance} ₽</div>
    </div>
  );
};

export default AccountCard;