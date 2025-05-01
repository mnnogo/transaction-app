import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiEye,
  FiPlus,
  FiArrowLeft,
} from 'react-icons/fi';
import Header from '../../components/layout/Header/Header';
import OverviewCard from '../../components/layout/OverviewCard/OverviewCard';
import AccountCard from '../../components/layout/AccountCard/AccountCard';
import styles from './DashboardPage.module.css';

const DashboardPage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const balanceData = [
    { title: 'Общий баланс', amount: '44,500.00' },
    { title: 'Доходы', amount: '54,500.00' },
    { title: 'Расходы', amount: '10,000.00' }
  ];

  const accountsData = [
    { name: 'Главный счет', balance: '44,500.00' },
    { name: 'На машину', balance: '44,500.00' },
    { name: 'Отпускные', balance: '44,500.00' }
  ];

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className={styles.dashboard}>
      <Header onProfileClick={handleProfileClick} />
      
      <main className={styles.main}>
        <div className={styles.leftColumn}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Общий вид</h2>
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
                />
              ))}
            </div>
          </section>
        </div>

        <div className={styles.rightColumn}>
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