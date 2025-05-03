import React, { useState } from 'react';
import styles from './TransferModal.module.css';

const TransferModal = ({ onClose, accounts, selectedAccount, onTransferSuccess, isLoading }) => {
  const [formData, setFormData] = useState({
    fromAccountId: selectedAccount?.accountId || '',
    toAccountId: '',
    amount: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fromAccountId || !formData.toAccountId || !formData.amount) {
      setError('Заполните все поля');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      setError('Введите корректное значение');
      return;
    }

    if (amount < 10) {
      setError('Минимальная сумма перевода - 10.00 рублей');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          fromAccountId: formData.fromAccountId,
          toAccountId: formData.toAccountId,
          amount: amount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при выполнении перевода');
      }

      onTransferSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (error) setError('');
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <form onSubmit={handleSubmit} className={styles.transferForm} noValidate>
          <h2>Перевод средств</h2>
          
          <div className={styles.formGroup}>
            <label>Счет списания</label>
            <select
              name="fromAccountId"
              value={formData.fromAccountId}
              onChange={handleChange}
              required
              disabled={isSubmitting || isLoading}
              className={styles.customSelect}
            >
              {accounts.map(account => (
                <option key={account.accountId} value={account.accountId}>
                  {account.accountId} ({account.name})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Счет зачисления</label>
            <input
              type="text"
              name="toAccountId"
              value={formData.toAccountId}
              onChange={handleChange}
              required
              disabled={isSubmitting || isLoading}
              className={styles.accountInput}
              placeholder="Введите номер счета"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Сумма перевода (₽)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="10.01"
              step="0.01"
              required
              disabled={isSubmitting || isLoading}
              className={styles.amountInput}
            />
            <div className={styles.amountHint}>
              Допустимый диапазон: 10.01 - 29,999.99 ₽
            </div>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.buttonGroup}>
            <button 
              type="button" 
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={isSubmitting || isLoading}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className={styles.transferBtn}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Обработка...' : 'Перевести'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;