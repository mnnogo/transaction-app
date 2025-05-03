import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiEye,
  FiEyeOff,
  FiPlus,
  FiArrowLeft,
  FiDollarSign,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';
import Header from '../../components/layout/Header/Header';
import OverviewCard from '../../components/layout/OverviewCard/OverviewCard';
import AccountCard from '../../components/layout/AccountCard/AccountCard';
import TransferModal from '../../components/layout/TransferModal/TransferModal';
import AddAccountModal from '../../components/layout/AddAccountModal/AddAccountModal';
import styles from './DashboardPage.module.css';


import MyIcon from './logo_white.svg';

const DashboardPage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [accountsData, setAccountsData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [selectedOperationAccount, setSelectedOperationAccount] = useState(null);

  const email = localStorage.getItem('email');

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const accountsResponse = await fetch(`http://localhost:3000/api/accounts?email=${email}`);
        const accounts = await accountsResponse.json();
        
        const formattedAccounts = accounts.map(account => ({
          accountId: account.account_id,
          type: account.type,
          name: account.account_name,
          balance: account.current_balance,
          income: account.income,
          expenses: account.expense
        }));
        
        setAccountsData(formattedAccounts);
        if (formattedAccounts.length > 0) {
          setSelectedAccount(formattedAccounts[0]);
          setSelectedOperationAccount(formattedAccounts[0].accountId);
        }

        const transactionsResponse = await fetch(`http://localhost:3000/api/transactions?email=${email}`);
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [email]);

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const accountsResponse = await fetch(`http://localhost:3000/api/accounts?email=${email}`);
      const accounts = await accountsResponse.json();
      
      const formattedAccounts = accounts.map(account => ({
        accountId: account.account_id,
        type: account.type,
        name: account.account_name,
        balance: account.current_balance,
        income: account.income,
        expenses: account.expense
      }));
      
      setAccountsData(formattedAccounts);

      if (selectedAccount) {
        const updatedSelectedAccount = formattedAccounts.find(
          acc => acc.accountId === selectedAccount.accountId
        );
        setSelectedAccount(updatedSelectedAccount || formattedAccounts[0]);
      }

      const transactionsResponse = await fetch(`http://localhost:3000/api/transactions?email=${email}`);
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccountSuccess = async () => {
    await refreshData();
    setShowAddAccountModal(false);
  };

  const formatAmount = (amount) => {
    return isVisible ? parseFloat(amount).toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) : '******';
  };

  const handleDeposit = async () => {
    if (!amount || isNaN(amount)) {
      alert('Введите корректную сумму');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/accounts/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountId: selectedOperationAccount,
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка при зачислении средств');

      await refreshData();
      setShowDepositModal(false);
      setAmount('');
    } catch (error) {
      console.error('Ошибка:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(amount)) {
      alert('Введите корректную сумму');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/accounts/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountId: selectedOperationAccount,
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка при зачислении средств');

      await refreshData();
      setShowWithdrawModal(false);
      setAmount('');
    } catch (error) {
      console.error('Ошибка:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Данные для общего счета
  const totalBalanceData = [
    { 
      title: 'Общий баланс', 
      amount: formatAmount(accountsData.reduce((sum, acc) => sum + parseFloat(acc.balance), 0)) 
    },
    { 
      title: 'Общие доходы', 
      amount: formatAmount(accountsData.reduce((sum, acc) => sum + parseFloat(acc.income), 0)) 
    },
    { 
      title: 'Общие расходы', 
      amount: formatAmount(accountsData.reduce((sum, acc) => sum + parseFloat(acc.expenses), 0)) 
    }
  ];

  // Данные для выбранного счета
  const accountBalanceData = selectedAccount 
    ? [
        { title: 'Баланс', amount: formatAmount(selectedAccount.balance) },
        { title: 'Доходы', amount: formatAmount(selectedAccount.income) },
        { title: 'Расходы', amount: formatAmount(selectedAccount.expenses) }
      ]
    : [];

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('email');
    navigate('/');
  };

  const handleTransferSuccess = async () => {
    await refreshData();
    setShowTransferModal(false);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.topBar}></div>
      <Header onProfileClick={() => navigate('/profile')} />
      
      <main className={styles.main}>
        <div className={styles.leftColumn}>
          {/* Секция общего счета */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Общий счет</h2>
              <div className={styles.actions}>
                <button 
                  className={styles.eyeButton}
                  onClick={() => setIsVisible(!isVisible)}
                >
                  {isVisible ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                </button>
              </div>
            </div>
            <div className={styles.balanceGrid}>
              {totalBalanceData.map((item, index) => (
                <OverviewCard 
                  key={`total-${index}`}
                  title={item.title}
                  amount={item.amount}
                />
              ))}
            </div>
          </section>

          {/* Секция выбранного счета */}
          {selectedAccount && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>{selectedAccount.name}</h2>
              </div>
              <div className={styles.balanceGrid}>
                {accountBalanceData.map((item, index) => (
                  <OverviewCard 
                    key={`account-${index}`}
                    title={item.title}
                    amount={item.amount}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Секция списка счетов */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Мои счета</h2>
              <button 
                className={styles.addAccountButton}
                onClick={() => setShowAddAccountModal(true)}
                disabled={isLoading}
              >
                <FiPlus size={18} />
              </button>
            </div>
            <div className={styles.accountsGrid}>
              {accountsData.map((account) => (
                <AccountCard
                  key={account.accountId}
                  type={account.type}
                  accountId={account.accountId}
                  name={account.name}
                  balance={formatAmount(account.balance)}
                  onClick={() => handleAccountClick(account)}
                  isSelected={selectedAccount?.accountId === account.accountId}
                />
              ))}
            </div>
          </section>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.operationButtons}>
            <button 
              onClick={() => setShowDepositModal(true)}
              className={styles.depositButton}
              disabled={isLoading}
            >
              <FiTrendingUp className={styles.buttonIcon} />
              <span>Зачислить</span>
            </button>
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className={styles.withdrawButton}
              disabled={isLoading}
            >
              <FiTrendingDown className={styles.buttonIcon} />
              <span>Снять</span>
            </button>
          </div>

          <button 
            onClick={() => setShowTransferModal(true)}
            className={styles.transferButton}
            disabled={!selectedAccount || isLoading}
          >
            <FiDollarSign className={styles.transferIcon} />
            <span>Перевести</span>
          </button>

          <div className={styles.refreshSection}>
            <button 
              onClick={refreshData}
              className={styles.refreshHistoryButton}
              disabled={isLoading}
            >
              <FiRefreshCw size={18} className={isLoading ? styles.refreshIconLoading : ''} />
              <span>Обновить историю</span>
            </button>
          </div>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>История переводов</h2>
            </div>
            <div className={styles.transfersContainer}>
              {isLoading ? (
                <div className={styles.loading}>Загрузка...</div>
              ) : transactions.length > 0 ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.transfersTable}>
                    <thead>
                      <tr>
                        <th>Отправитель</th>
                        <th></th>
                        <th>Получатель</th>
                        <th>Сумма</th>
                        <th>Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td data-label="Отправитель">{transaction.from_account}</td>
                          <td className={styles.arrowCell}>→</td>
                          <td data-label="Получатель">{transaction.to_account}</td>
                          <td data-label="Сумма">{formatAmount(transaction.sum)} ₽</td>
                          <td data-label="Дата">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.noTransactions}>Нет операций</div>
              )}
            </div>
          </section>
        </div>
      </main>

      {showTransferModal && selectedAccount && (
        <TransferModal 
          onClose={() => setShowTransferModal(false)} 
          accounts={accountsData}
          selectedAccount={selectedAccount}
          onTransferSuccess={handleTransferSuccess}
          isLoading={isLoading}
        />
      )}

      {showAddAccountModal && (
        <AddAccountModal 
          onClose={() => setShowAddAccountModal(false)}
          onCreateAccount={handleAddAccountSuccess}
          isLoading={isLoading}
        />
      )}

      {/* Модальное окно зачисления */}
      {showDepositModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <h2>Зачисление средств</h2>
            <div className={styles.formGroup}>
              <label>Счет для зачисления</label>
              <select
                value={selectedOperationAccount}
                onChange={(e) => setSelectedOperationAccount(e.target.value)}
                className={styles.accountSelect}
              >
                {accountsData.map(account => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.name} ({formatAmount(account.balance)} ₽)
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Сумма зачисления</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Введите сумму"
                className={styles.amountInput}
              />
            </div>
            <div className={styles.modalButtons}>
              <button 
                onClick={() => setShowDepositModal(false)}
                className={styles.cancelButton}
              >
                Отмена
              </button>
              <button 
                onClick={handleDeposit}
                className={styles.confirmButton}
                disabled={isLoading}
              >
                {isLoading ? 'Зачисление...' : 'Зачислить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно снятия */}
      {showWithdrawModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <h2>Снятие средств</h2>
            <div className={styles.formGroup}>
              <label>Счет для снятия</label>
              <select
                value={selectedOperationAccount}
                onChange={(e) => setSelectedOperationAccount(e.target.value)}
                className={styles.accountSelect}
              >
                {accountsData.map(account => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.name} ({formatAmount(account.balance)} ₽)
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Сумма снятия</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Введите сумму"
                className={styles.amountInput}
              />
            </div>
            <div className={styles.modalButtons}>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className={styles.cancelButton}
              >
                Отмена
              </button>
              <button 
                onClick={handleWithdraw}
                className={styles.confirmButton}
                disabled={isLoading}
              >
                {isLoading ? 'Снятие...' : 'Снять'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <FiArrowLeft className={styles.arrowIcon} size={18} />
          <span>Выйти</span>
        </button>
      </footer>
    </div>
  );
};

export default DashboardPage;