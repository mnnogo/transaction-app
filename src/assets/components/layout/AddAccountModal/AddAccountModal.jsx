import React, { useState } from 'react';
import styles from './AddAccountModal.module.css';

const AddAccountModal = ({ onClose, onCreateAccount, isLoading }) => {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('debit');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accountName.trim()) {
      setError('Введите название счета');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/accounts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountName: accountName,
          accountType: accountType,
          email: localStorage.getItem('email')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании счета');
      }

      onCreateAccount();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <form onSubmit={handleSubmit} className={styles.accountForm}>
          <h2>Создать новый счет</h2>
          
          <div className={styles.formGroup}>
            <label>Название счета</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => {
                setAccountName(e.target.value);
                setError('');
              }}
              required
              disabled={isLoading}
              className={styles.accountInput}
              placeholder="Мой новый счет"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Тип счета</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              disabled={isLoading}
              className={styles.typeSelect}
            >
              <option value="debit">Дебетовая карта</option>
              <option value="credit">Кредитная карта</option>
            </select>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.buttonGroup}>
            <button 
              type="button" 
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={isLoading}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className={styles.createBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;