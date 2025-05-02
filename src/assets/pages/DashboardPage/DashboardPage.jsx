import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiEye,
  FiEyeOff,
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
  const [isVisible, setIsVisible] = useState(true);
  const [accountsData, setAccountsData] = useState([]);

  const email = localStorage.getItem('email');  

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/accounts?email=${email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        const formattedData = data.map(account => ({
          id: account.id,
          name: account.account_name,
          balance: isVisible ? account.current_balance.toLocaleString('ru-RU') + '.00' : '******',
          income: isVisible ? account.income.toLocaleString('ru-RU') + '.00' : '******',
          expenses: isVisible ? account.expense.toLocaleString('ru-RU') + '.00' : '******'
        }));
        
        setAccountsData(formattedData);
        if (formattedData.length > 0) {
          setSelectedAccount(formattedData[0]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке счетов:', error);
      }
    };

    fetchAccounts();
  }, [email, isVisible]);

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
  };

  const balanceData = selectedAccount 
    ? [
        { title: 'Баланс', amount: isVisible ? selectedAccount.balance : '******' },
        { title: 'Доходы', amount: isVisible ? selectedAccount.income : '******' },
        { title: 'Расходы', amount: isVisible ? selectedAccount.expenses : '******' }
      ]
    : [
        { title: 'Общий баланс', amount: isVisible ? accountsData.reduce((sum, acc) => sum + parseFloat(acc.balance.replace(/,/g, '')), 0).toLocaleString('ru-RU') + '.00' : '******'},
        { title: 'Общие доходы', amount: isVisible ? accountsData.reduce((sum, acc) => sum + parseFloat(acc.income.replace(/,/g, '')), 0).toLocaleString('ru-RU') + '.00' : '******'},
        { title: 'Общие расходы', amount: isVisible ? accountsData.reduce((sum, acc) => sum + parseFloat(acc.expenses.replace(/,/g, '')), 0).toLocaleString('ru-RU') + '.00' : '******'}
      ];

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('email');
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
              <h2>{selectedAccount ? `${selectedAccount.id}` : 'Общий вид'}</h2>
              <h2>{selectedAccount ? `${selectedAccount.name}` : 'Общий вид'}</h2>
              <button 
                className={styles.eyeButton}
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? <FiEye size={20} /> : <FiEyeOff size={20} />}
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
                  id={account.id}
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