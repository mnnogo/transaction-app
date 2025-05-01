import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiEye,
  FiPlus,
  FiArrowLeft,
  FiDollarSign
} from 'react-icons/fi';
import Header from '../../components/layout/Header/Header';
import OverviewCard from '../../components/layout/OverviewCard/OverviewCard';
import AccountCard from '../../components/layout/AccountCard/AccountCard';
import TransferModal from '../../components/layout/TransferModal/TransferModal';
import styles from './DashboardPage.module.css';

const DashboardPage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const accountsData = [
    { name: 'Главный счет', balance: '44,500.00', income: '54,500.00', expenses: '10,000.00' },
    { name: 'На машину', balance: '22,000.00', income: '25,000.00', expenses: '3,000.00' },
    { name: 'Отпускные', balance: '15,000.00', income: '20,000.00', expenses: '5,000.00' }
  ];

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
  };

  const balanceData = selectedAccount 
    ? [
        { title: 'Баланс', amount: selectedAccount.balance },
        { title: 'Доходы', amount: selectedAccount.income },
        { title: 'Расходы', amount: selectedAccount.expenses }
      ]
    : [
        { title: 'Общий баланс', amount: accountsData.reduce((sum, acc) => sum + parseFloat(acc.balance.replace(/,/g, '')), 0).toLocaleString('ru-RU') + '.00' },
        { title: 'Общие доходы', amount: accountsData.reduce((sum, acc) => sum + parseFloat(acc.income.replace(/,/g, '')), 0).toLocaleString('ru-RU') + '.00' },
        { title: 'Общие расходы', amount: accountsData.reduce((sum, acc) => sum + parseFloat(acc.expenses.replace(/,/g, '')), 0).toLocaleString('ru-RU') + '.00' }
      ];

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    navigate('/');
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
              <button className={styles.eyeButton}>
                <FiEye size={20} />
              </button>
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
              <button className={styles.addButton}>
                <FiPlus size={20} />
              </button>
            </div>
            <div className={styles.accountsGrid}>
              {accountsData.map((account, index) => (
                <AccountCard
                  key={index}
                  name={account.name}
                  balance={account.balance}
                  onClick={() => handleAccountClick(account)}
                  isSelected={selectedAccount?.name === account.name}
                />
              ))}
            </div>
          </section>
        </div>

        <div className={styles.rightColumn}>
          <button 
            onClick={() => setShowTransferModal(true)}
            className={styles.transferButton}
          >
            <FiDollarSign className={styles.transferIcon} />
            <span>Перевести</span>
          </button>

          <section className={styles.section}>
            <h2>Переводы</h2>
            <table className={styles.transfersTable}>
              <tbody>
                <tr>
                  <td>Счет А</td>
                  <td>→</td>
                  <td>Счет Б</td>
                  <td>10,000.00</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </main>

      {showTransferModal && (
        <TransferModal 
          onClose={() => setShowTransferModal(false)} 
          accounts={accountsData}
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