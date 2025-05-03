import React from 'react';
import styles from './AccountCard.module.css';

const AccountCard = ({ type, accountId, name, balance, onClick, isSelected }) => {
  const formatAccountNumber = (id) => {
    return id.toString().padStart(8, '0');
  };

  const getAccountTypeLabel = (type) => {
    return type === 'debit' ? 'Дебетовый' : 'Кредитный';
  };

  return (
    <div 
      className={`${styles.accountCard} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.accountInfo}>
        <div className={styles.accountHeader}>
          <span className={styles.accountName}>{name}</span>
          <span className={`${styles.accountType} ${type === 'credit' ? styles.credit : ''}`}>
            {getAccountTypeLabel(type)}
          </span>
        </div>
        <div className={styles.accountNumber}>
          № {formatAccountNumber(accountId)}
        </div>
        <div className={styles.balance}>
          {balance} ₽
        </div>
      </div>
    </div>
  );
};

export default AccountCard;