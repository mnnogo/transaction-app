import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiEye,
  FiEyeOff,
  FiPlus,
  FiArrowLeft,
  FiDollarSign,
  FiRefreshCw
} from 'react-icons/fi';
import Header from '../../components/layout/Header/Header';
import OverviewCard from '../../components/layout/OverviewCard/OverviewCard';
import AccountCard from '../../components/layout/AccountCard/AccountCard';
import TransferModal from '../../components/layout/TransferModal/TransferModal';
import AddAccountModal from '../../components/layout/AddAccountModal/AddAccountModal';
import styles from './DashboardPage.module.css';

const DashboardPage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [accountsData, setAccountsData] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const email = localStorage.getItem('email');

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Загрузка счетов
        const accountsResponse = await fetch(`http://localhost:3000/api/accounts?email=${email}`);
        const accounts = await accountsResponse.json();
        
        const formattedAccounts = accounts.map(account => ({
          accountId: account.account_id,
          name: account.account_name,
          balance: account.current_balance,
          income: account.income,
          expenses: account.expense
        }));
        
        setAccountsData(formattedAccounts);
        if (formattedAccounts.length > 0) {
          setSelectedAccount(formattedAccounts[0]);
        }

        // Загрузка транзакций
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
        name: account.account_name,
        balance: account.current_balance,
        income: account.income,
        expenses: account.expense
      }));
      
      setAccountsData(formattedAccounts);

      // Обновляем выбранный счет
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

  const balanceData = selectedAccount 
    ? [
        { title: 'Баланс', amount: formatAmount(selectedAccount.balance) },
        { title: 'Доходы', amount: formatAmount(selectedAccount.income) },
        { title: 'Расходы', amount: formatAmount(selectedAccount.expenses) }
      ]
    : [
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
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>{selectedAccount ? `${selectedAccount.name}` : 'Общий вид'}</h2>
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
              {balanceData.map((item, index) => (
                <OverviewCard 
                  key={index}
                  title={item.title}
                  amount={item.amount}
                />
              ))}
            </div>
          </section>

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