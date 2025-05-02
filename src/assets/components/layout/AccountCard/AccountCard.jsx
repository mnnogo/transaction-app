import React from 'react';
import styles from './AccountCard.module.css';

const AccountCard = ({ id, name, balance, onClick, isSelected }) => {
  return (
    <div 
      className={`${styles.accountCard} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <h3>{id}</h3>
      <h3>{name}</h3>
      <p className={styles.balance}>{balance} ₽</p>
    </div>
  );
};

export default AccountCard;