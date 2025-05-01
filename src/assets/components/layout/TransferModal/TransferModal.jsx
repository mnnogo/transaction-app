import React, { useState, useEffect } from 'react';
import styles from './TransferModal.module.css';

const TransferModal = ({ onClose, accounts }) => {
  const [formData, setFormData] = useState({
    fromAccount: accounts[0]?.name || '',
    toAccount: accounts[1]?.name || '',
    amount: ''
  });
  const [maxAmount, setMaxAmount] = useState(0);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Обновляем максимальную сумму при изменении счета списания
  useEffect(() => {
    if (formData.fromAccount) {
      const selectedAccount = accounts.find(acc => acc.name === formData.fromAccount);
      if (selectedAccount) {
        const balance = parseFloat(selectedAccount.balance.replace(/,/g, ''));
        setMaxAmount(balance);
        
        // Если текущая сумма больше нового баланса, сбрасываем ее
        if (formData.amount && parseFloat(formData.amount) > balance) {
          setFormData(prev => ({ ...prev, amount: '' }));
          setError('Сумма превышает доступный баланс');
        }
      }
    }
  }, [formData.fromAccount, accounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      setError('Введите корректную сумму');
      return;
    }
    
    if (amount < 10) {
      setError('Минимальная сумма перевода - 10 рублей');
      return;
    }
    
    if (amount > maxAmount) {
      setError('Недостаточно средств на счете');
      return;
    }

    console.log('Перевод:', formData);
    setIsSuccess(true); // Показываем сообщение об успехе вместо закрытия
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      // Проверяем, что ввод - положительное число
      if (value && (!/^\d*\.?\d*$/.test(value) || parseFloat(value) < 0)) {
        return;
      }
      setError('');
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isSuccess) {
    return (
      <div className={styles.modalOverlay}>
        <div className={`${styles.modalContainer} ${styles.successModal}`}>
          <div className={styles.successWindow}>
            <h2>Успешно!</h2>
            <button 
              onClick={onClose}
              className={styles.backBtn}
            >
              Вернуться
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <form onSubmit={handleSubmit} className={styles.transferForm}>
          <h2>Перевод</h2>

          <div className={styles.formGroup}>
            <label htmlFor="from-account">Счет списания</label>
            <select 
              id="from-account" 
              name="fromAccount"
              value={formData.fromAccount}
              onChange={handleChange}
              className={styles.customSelect}
            >
              {accounts.map(account => (
                <option key={account.name} value={account.name}>
                  {account.name} ({account.balance})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="to-account">Счет пополнения</label>
            <select 
              id="to-account" 
              name="toAccount"
              value={formData.toAccount}
              onChange={handleChange}
              className={styles.customSelect}
            >
              {accounts
                .filter(a => a.name !== formData.fromAccount)
                .map(account => (
                  <option key={account.name} value={account.name}>
                    {account.name} ({account.balance})
                  </option>
                ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount">Сумма (доступно: {maxAmount.toLocaleString('ru-RU')} ₽)</label>
            <input 
              type="number" 
              id="amount" 
              name="amount"
              placeholder="20 000" 
              className={styles.amountInput}
              value={formData.amount}
              onChange={handleChange}
              min="10"
              max={maxAmount}
              step="1"
            />
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>

          <div className={styles.buttonGroup}>
            <button 
              type="button" 
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className={styles.transferBtn}
              disabled={!formData.amount || parseFloat(formData.amount) <= 0}
            >
              Перевести
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;